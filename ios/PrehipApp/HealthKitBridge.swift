import Foundation
import HealthKit
import WebKit

final class HealthKitBridge: NSObject, WKScriptMessageHandler {
    weak var webView: WKWebView?

    private let healthStore = HKHealthStore()
    private let authorizationFlag = "prehip.healthkit.authorizationRequested"
    private let iso = ISO8601DateFormatter()

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "prehipHealthKit",
              let body = message.body as? [String: Any],
              let id = body["id"] as? String,
              let action = body["action"] as? String else {
            return
        }

        switch action {
        case "status":
            send(id: id, data: [
                "available": HKHealthStore.isHealthDataAvailable(),
                "authorizationRequested": UserDefaults.standard.bool(forKey: authorizationFlag)
            ])

        case "requestAuthorization":
            requestAuthorization(id: id)

        case "sync":
            sync(id: id)

        default:
            send(id: id, error: "Unbekannte Apple-Health-Aktion: \(action)")
        }
    }

    private var readTypes: Set<HKObjectType> {
        var types = Set<HKObjectType>()
        if let bodyMass = HKObjectType.quantityType(forIdentifier: .bodyMass) {
            types.insert(bodyMass)
        }
        if let stepCount = HKObjectType.quantityType(forIdentifier: .stepCount) {
            types.insert(stepCount)
        }
        types.insert(HKObjectType.workoutType())
        return types
    }

    private func requestAuthorization(id: String) {
        guard HKHealthStore.isHealthDataAvailable() else {
            send(id: id, error: "HealthKit ist auf diesem Gerät nicht verfügbar.")
            return
        }

        healthStore.requestAuthorization(toShare: Set<HKSampleType>(), read: readTypes) { [weak self] success, error in
            guard let self else { return }
            UserDefaults.standard.set(true, forKey: self.authorizationFlag)

            if let error {
                self.send(id: id, error: error.localizedDescription)
                return
            }

            self.send(id: id, data: [
                "available": true,
                "requestCompleted": success,
                "authorizationRequested": true
            ])
        }
    }

    private func sync(id: String) {
        guard HKHealthStore.isHealthDataAvailable() else {
            send(id: id, error: "HealthKit ist auf diesem Gerät nicht verfügbar.")
            return
        }

        fetchLatestWeight { [weak self] weight in
            guard let self else { return }
            self.fetchTodaySteps { steps in
                self.fetchRecentWorkouts { workouts in
                    var data: [String: Any] = [
                        "available": true,
                        "authorizationRequested": UserDefaults.standard.bool(forKey: self.authorizationFlag),
                        "workouts": workouts
                    ]
                    if let weight { data["latestWeight"] = weight }
                    if let steps { data["todaySteps"] = steps }
                    self.send(id: id, data: data)
                }
            }
        }
    }

    private func fetchLatestWeight(completion: @escaping ([String: Any]?) -> Void) {
        guard let type = HKObjectType.quantityType(forIdentifier: .bodyMass) else {
            completion(nil)
            return
        }

        let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
        let query = HKSampleQuery(sampleType: type, predicate: nil, limit: 1, sortDescriptors: [sort]) { [weak self] _, samples, _ in
            guard let self,
                  let sample = samples?.first as? HKQuantitySample else {
                completion(nil)
                return
            }

            let kg = sample.quantity.doubleValue(for: HKUnit.gramUnit(with: .kilo))
            completion([
                "kg": kg,
                "date": self.iso.string(from: sample.endDate),
                "source": sample.sourceRevision.source.name
            ])
        }
        healthStore.execute(query)
    }

    private func fetchTodaySteps(completion: @escaping ([String: Any]?) -> Void) {
        guard let type = HKObjectType.quantityType(forIdentifier: .stepCount) else {
            completion(nil)
            return
        }

        let calendar = Calendar.current
        let start = calendar.startOfDay(for: Date())
        let predicate = HKQuery.predicateForSamples(withStart: start, end: Date(), options: .strictStartDate)
        let query = HKStatisticsQuery(quantityType: type, quantitySamplePredicate: predicate, options: .cumulativeSum) { [weak self] _, result, _ in
            guard let self else { return }
            let count = result?.sumQuantity()?.doubleValue(for: .count()) ?? 0
            completion([
                "count": count,
                "date": self.iso.string(from: Date())
            ])
        }
        healthStore.execute(query)
    }

    private func fetchRecentWorkouts(completion: @escaping ([[String: Any]]) -> Void) {
        let type = HKObjectType.workoutType()
        let since = Calendar.current.date(byAdding: .day, value: -30, to: Date()) ?? Date().addingTimeInterval(-30 * 86_400)
        let predicate = HKQuery.predicateForSamples(withStart: since, end: Date(), options: .strictStartDate)
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)

        let query = HKSampleQuery(sampleType: type, predicate: predicate, limit: 100, sortDescriptors: [sort]) { [weak self] _, samples, _ in
            guard let self else { return }
            let workouts = (samples as? [HKWorkout] ?? []).map { workout -> [String: Any] in
                [
                    "id": workout.uuid.uuidString,
                    "activityType": Int(workout.workoutActivityType.rawValue),
                    "start": self.iso.string(from: workout.startDate),
                    "end": self.iso.string(from: workout.endDate),
                    "durationMinutes": workout.duration / 60.0,
                    "source": workout.sourceRevision.source.name
                ]
            }
            completion(workouts)
        }
        healthStore.execute(query)
    }

    private func send(id: String, data: [String: Any]) {
        send(payload: ["id": id, "ok": true, "data": data])
    }

    private func send(id: String, error: String) {
        send(payload: ["id": id, "ok": false, "error": error])
    }

    private func send(payload: [String: Any]) {
        guard JSONSerialization.isValidJSONObject(payload),
              let jsonData = try? JSONSerialization.data(withJSONObject: payload),
              let json = String(data: jsonData, encoding: .utf8) else {
            return
        }

        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript("window.prehipHealthNativeReceive(\(json));")
        }
    }
}

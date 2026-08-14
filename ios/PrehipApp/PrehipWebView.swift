import SwiftUI
import WebKit

struct PrehipWebView: UIViewRepresentable {
    final class Coordinator: NSObject, WKNavigationDelegate {
        let healthKitBridge = HealthKitBridge()
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.userContentController.add(context.coordinator.healthKitBridge, name: "prehipHealthKit")

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        context.coordinator.healthKitBridge.webView = webView

        if let url = URL(string: "https://sebmut.github.io/prehab/") {
            webView.load(URLRequest(url: url, cachePolicy: .reloadRevalidatingCacheData))
        }
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    static func dismantleUIView(_ webView: WKWebView, coordinator: Coordinator) {
        webView.configuration.userContentController.removeScriptMessageHandler(forName: "prehipHealthKit")
        coordinator.healthKitBridge.webView = nil
    }
}

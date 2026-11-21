package io.github.x500334arch.super100mission2027;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Message;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.graphics.Typeface;

import java.util.concurrent.atomic.AtomicBoolean;

public final class MainActivity extends Activity {
    private static final String SITE = "https://x500334-arch.github.io/super100-mission-2027/";
    // Versioned launch URL prevents Android WebView from reusing an obsolete login screen.
    private static final String LAUNCH_URL = SITE + "?native_rev=auth-screen-20261122-v2";
    private static final String TRUSTED_HOST = "x500334-arch.github.io";
    private static final String TRUSTED_PATH = "/super100-mission-2027/";

    private WebView webView;
    private LinearLayout loadingPanel;
    private TextView statusText;
    private Button retryButton;
    private boolean failedMainFrame = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(13, 37, 77));
        getWindow().setNavigationBarColor(Color.rgb(13, 37, 77));

        FrameLayout frame = new FrameLayout(this);
        frame.setBackgroundColor(Color.rgb(243, 247, 254));
        setContentView(frame);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(243, 247, 254));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        frame.addView(webView, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        // Only the exact GitHub Pages app origin navigates inside our WebView.
        // Never disable SSL checks or expose a JavaScript-to-native bridge.
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);  // Required by the existing Supabase website.
        // Always fetch current HTML/JS over HTTPS; this does not remove auth cookies,
        // Supabase localStorage, offline challenge checkboxes or synced student data.
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.clearCache(true);
        settings.setDomStorageEnabled(true);  // Required for existing login/local storage.
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (request.isForMainFrame() && isTrusted(uri)) return false;
                if (request.isForMainFrame()) {
                    openExternal(uri);
                    return true;
                }
                return false;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap icon) {
                failedMainFrame = false;
                showLoading("Opening your learning workspace...");
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (!failedMainFrame) hideLoading();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    failedMainFrame = true;
                    showOffline();
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onCreateWindow(WebView parent, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                if (!isUserGesture) return false;
                // PDF and other target=_blank links open in the device's browser/
                // PDF viewer, rather than opening a non-working blank WebView.
                WebView popup = new WebView(MainActivity.this);
                AtomicBoolean opened = new AtomicBoolean(false);
                popup.setWebViewClient(new WebViewClient() {
                    private void launchOnce(Uri uri, WebView view) {
                        if (opened.compareAndSet(false, true)) openExternal(uri);
                        view.post(view::destroy);
                    }

                    @Override
                    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                        launchOnce(request.getUrl(), view);
                        return true;
                    }

                    @Override
                    public void onPageStarted(WebView view, String url, Bitmap favicon) {
                        if (!"about:blank".equals(url)) {
                            launchOnce(Uri.parse(url), view);
                            view.stopLoading();
                        }
                    }
                });
                ((WebView.WebViewTransport) resultMsg.obj).setWebView(popup);
                resultMsg.sendToTarget();
                return true;
            }
        });

        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) ->
            openExternal(Uri.parse(url))
        );

        loadingPanel = new LinearLayout(this);
        loadingPanel.setOrientation(LinearLayout.VERTICAL);
        loadingPanel.setGravity(Gravity.CENTER);
        loadingPanel.setPadding(dp(25), dp(25), dp(25), dp(25));
        loadingPanel.setBackgroundColor(Color.rgb(243, 247, 254));

        ImageView logo = new ImageView(this);
        logo.setImageResource(R.drawable.app_icon);
        LinearLayout.LayoutParams logoParams = new LinearLayout.LayoutParams(dp(100), dp(100));
        logoParams.bottomMargin = dp(19);
        loadingPanel.addView(logo, logoParams);

        TextView title = new TextView(this);
        title.setText("SUPER 100");
        title.setTextColor(Color.rgb(18, 65, 132));
        title.setTextSize(27);
        title.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        title.setGravity(Gravity.CENTER);
        loadingPanel.addView(title);

        TextView subtitle = new TextView(this);
        subtitle.setText("MISSION 2027  •  MATHEMATICS");
        subtitle.setTextColor(Color.rgb(75, 100, 143));
        subtitle.setTextSize(12);
        subtitle.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams subtitleParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        subtitleParams.topMargin = dp(5);
        loadingPanel.addView(subtitle, subtitleParams);

        ProgressBar spinner = new ProgressBar(this);
        LinearLayout.LayoutParams spinnerParams = new LinearLayout.LayoutParams(dp(35), dp(35));
        spinnerParams.topMargin = dp(25);
        loadingPanel.addView(spinner, spinnerParams);

        statusText = new TextView(this);
        statusText.setTextColor(Color.rgb(72, 96, 133));
        statusText.setTextSize(13);
        statusText.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams statusParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        statusParams.topMargin = dp(13);
        loadingPanel.addView(statusText, statusParams);

        retryButton = new Button(this);
        retryButton.setText("Retry / दोबारा खोलें");
        retryButton.setAllCaps(false);
        retryButton.setOnClickListener(v -> {
            failedMainFrame = false;
            showLoading("Connecting...");
            webView.loadUrl(LAUNCH_URL);
        });
        loadingPanel.addView(retryButton);

        frame.addView(loadingPanel, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));
        showLoading("Opening your learning workspace...");

        if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
            webView.loadUrl(LAUNCH_URL);
        }
    }

    private void showLoading(String message) {
        if (loadingPanel == null) return;
        loadingPanel.setVisibility(View.VISIBLE);
        statusText.setText(message);
        retryButton.setVisibility(View.GONE);
    }

    private void hideLoading() {
        if (loadingPanel != null) loadingPanel.setVisibility(View.GONE);
    }

    private void showOffline() {
        if (loadingPanel == null) return;
        loadingPanel.setVisibility(View.VISIBLE);
        statusText.setText("Connection unavailable. Internet is required for login, tests and PDFs.");
        retryButton.setVisibility(View.VISIBLE);
    }

    private boolean isTrusted(Uri uri) {
        return uri != null
            && "https".equalsIgnoreCase(uri.getScheme())
            && TRUSTED_HOST.equalsIgnoreCase(uri.getHost())
            && uri.getPath() != null
            && uri.getPath().startsWith(TRUSTED_PATH);
    }

    private void openExternal(Uri uri) {
        if (uri == null) return;
        String scheme = uri.getScheme();
        if (scheme == null) return;
        if (!"https".equalsIgnoreCase(scheme) &&
            !"http".equalsIgnoreCase(scheme) &&
            !"mailto".equalsIgnoreCase(scheme) &&
            !"tel".equalsIgnoreCase(scheme)) return;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException ignored) {
            // No external app available; keep the study workspace usable.
        }
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}

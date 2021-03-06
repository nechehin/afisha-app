<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<widget
        id="com.ionicframework.app403108"
        version="0.0.1"
        xmlns="http://www.w3.org/ns/widgets"
        xmlns:cdv="http://cordova.apache.org/ns/1.0"
        xmlns:gap="http://phonegap.com/ns/1.0">
    <name>app</name>

    <description>
        An Ionic Framework and Cordova project.
    </description>
    <author email="you@example.com" href="http://example.com.com/">
        Your Name Here
    </author>
    <content src="index.html"/>
    <access origin="*"/>
    <preference name="webviewbounce" value="false"/>
    <preference name="UIWebViewBounce" value="false"/>
    <preference name="DisallowOverscroll" value="true"/>
    <preference name="android-minSdkVersion" value="16"/>
    <preference name="BackupWebStorage" value="none"/>

    <preference name="phonegap-version" value="cli-5.2.0"/>

    <gap:plugin name="org.crosswalk.engine" source="pgb" version="1.3.0"/>
    <gap:plugin name="cordova-plugin-legacy-whitelist" source="npm"/>
    <gap:plugin name="cordova-plugin-splashscreen" source="npm"/>
    <gap:plugin name="com.danielcwilson.plugins.googleanalytics" version="0.6.1"/>
    <gap:plugin name="cordova-plugin-inappbrowser" source="npm"/>

    <feature name="StatusBar">
        <param name="ios-package" value="CDVStatusBar" onload="true"/>
    </feature>
</widget>
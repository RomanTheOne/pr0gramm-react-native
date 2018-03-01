IOS does not allow http requests by default, only https:
Append to your info.plist file under ios/{project_name}

<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>

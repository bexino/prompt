# btn1

```
Windows Registry Editor Version 5.00

; ============================================
; 校验
; ============================================

[HKEY_CURRENT_USER\Software\Classes\*\shell\VerifyHash]
"MUIVerb"="校验"
"SubCommands"=""
"Icon"="powershell.exe"


; MD5

[HKEY_CURRENT_USER\Software\Classes\*\shell\VerifyHash\shell\01_MD5]
"MUIVerb"="MD5"

[HKEY_CURRENT_USER\Software\Classes\*\shell\VerifyHash\shell\01_MD5\command]
@="powershell.exe -NoProfile -NoExit -Command \"Get-FileHash -LiteralPath '%1' -Algorithm MD5 | Format-List\""


; SHA1

[HKEY_CURRENT_USER\Software\Classes\*\shell\VerifyHash\shell\02_SHA1]
"MUIVerb"="SHA1"

[HKEY_CURRENT_USER\Software\Classes\*\shell\VerifyHash\shell\02_SHA1\command]
@="powershell.exe -NoProfile -NoExit -Command \"Get-FileHash -LiteralPath '%1' -Algorithm SHA1 | Format-List\""


; SHA256

[HKEY_CURRENT_USER\Software\Classes\*\shell\VerifyHash\shell\03_SHA256]
"MUIVerb"="SHA256"

[HKEY_CURRENT_USER\Software\Classes\*\shell\VerifyHash\shell\03_SHA256\command]
@="powershell.exe -NoProfile -NoExit -Command \"Get-FileHash -LiteralPath '%1' -Algorithm SHA256 | Format-List\""


; SHA384

[HKEY_CURRENT_USER\Software\Classes\*\shell\VerifyHash\shell\04_SHA384]
"MUIVerb"="SHA384"

[HKEY_CURRENT_USER\Software\Classes\*\shell\VerifyHash\shell\04_SHA384\command]
@="powershell.exe -NoProfile -NoExit -Command \"Get-FileHash -LiteralPath '%1' -Algorithm SHA384 | Format-List\""


; SHA512

[HKEY_CURRENT_USER\Software\Classes\*\shell\VerifyHash\shell\05_SHA512]
"MUIVerb"="SHA512"

[HKEY_CURRENT_USER\Software\Classes\*\shell\VerifyHash\shell\05_SHA512\command]
@="powershell.exe -NoProfile -NoExit -Command \"Get-FileHash -LiteralPath '%1' -Algorithm SHA512 | Format-List\""
```

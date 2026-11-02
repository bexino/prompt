# Desc

- 类型：注册表文件 `.reg`

# btn1

```
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Software\Classes\.md]
@="Markdown.Document"

[HKEY_CURRENT_USER\Software\Classes\.md\ShellNew]
"NullFile"=""

[HKEY_CURRENT_USER\Software\Classes\Markdown.Document]
@="New Markdown Document"

[HKEY_CURRENT_USER\Software\Classes\Markdown.Document\DefaultIcon]
@="%SystemRoot%\\System32\\notepad.exe,0"

[HKEY_CURRENT_USER\Software\Classes\Markdown.Document\shell\open\command]
@="\"%SystemRoot%\\System32\\notepad.exe\" \"%1\""
```

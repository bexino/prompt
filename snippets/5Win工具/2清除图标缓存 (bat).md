# Desc
可以解决桌面图标变白色方块的问题。

# btn1

```
@echo off
taskkill /f /im explorer.exe
CD /d %userprofile%\AppData\Local
DEL IconCache.db /a
CD /d %userprofile%\AppData\Local\Microsoft\Windows\Explorer
DEL iconcache*.db /a
DEL thumbcache*.db /a
start explorer.exe
```

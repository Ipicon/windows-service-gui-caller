Set objShell = CreateObject("WScript.Shell") 
objShell.Run "powershell -ExecutionPolicy Bypass -File select-folder.ps1", 0, False
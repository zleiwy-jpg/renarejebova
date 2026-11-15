# Rəna Rəcəbova.az

## Online sınaq

Naviqasiyadakı **Online sınaq** bölməsində şagird adını, Azərbaycan mobil nömrəsini və səviyyəsini daxil edib 20 suallıq riyaziyyat sınağı verə bilər. Hər dəfə seçilmiş səviyyənin proqram mövzuları üzrə sual bankından təsadüfi suallar təqdim olunur; cavabı boş saxlamaq, geri qayıtmaq və nəticədə düzgün, səhv və boş cavabları nəzərdən keçirmək mümkündür.

Sınaq və nəticənin hesablanması brauzerdə işləyir. Daxil edilmiş ad və nömrə serverə göndərilmir və brauzerdə saxlanılmır. Sual bankı saytla birlikdə gəlir; suallar canlı olaraq internetdən endirilmir və süni intellekt istifadə edilmir.

## Local işə salma və AI qurulumu

Yazılı söz məsələlərini təhlil etmək üçün Google Gemini API açarı lazımdır. Açarı brauzer koduna və ya layihə fayllarına yazmayın; server onu `GOOGLE_API_KEY` mühit dəyişənindən oxuyur.

1. [Google AI Studio](https://aistudio.google.com/apikey) səhifəsində API açarı yaradın və Gemini API üçün pulsuz planın mövcudluğunu yoxlayın.
2. Layihə qovluğunda PowerShell-i açıb serveri bu əmrlə başladın. Açara yazarkən ekranda göstərilmir və fayla yazılmır. Standart 8000 portu artıq istifadə olunursa, əmrdə `-Port 8001` seçin:

   ```powershell
   $secureKey = Read-Host "Gemini API key" -AsSecureString
   $keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
   try {
     $env:GOOGLE_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
     .\serve.ps1 -Port 8001
   } finally {
     [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
     Remove-Item Env:GOOGLE_API_KEY -ErrorAction SilentlyContinue
   }
   ```

3. Saytı `http://127.0.0.1:8001/` ünvanında açın. Server işləyərkən həmin PowerShell pəncərəsini bağlamayın; dayandırmaq üçün `Ctrl+C` basın.

Tənliklər brauzerdə həll olunur. Söz məsələsinin mətni isə serverdən Google Gemini-yə göndərilir; API açarı yalnız serverdə qalır. Google-ın pulsuz plan şərtlərinə görə göndərilən məlumat xidmətlərini təkmilləşdirmək üçün istifadə oluna bilər. Həssas və şəxsi məlumatları daxil etməyin. Pulsuz istifadə limitləri və mövcud modellər dəyişə bilər.

Əgər Windows PowerShell skriptlərin işə salınmasını bloklayırsa, yalnız açıq olan həmin PowerShell pəncərəsi üçün icazə verin:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
```

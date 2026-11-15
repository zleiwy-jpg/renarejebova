param($Port=8081)
$root = 'P:\NCAFE\design\desktop\rena_son\renarejebova'
$prefix = "http://127.0.0.1:$Port/"
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
try { $listener.Start() } catch { throw "Cannot start server on port $Port" }
Write-Output "Serving $root at $prefix"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    $path = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
    
    if ($path -eq '/') { $path = '/index.html' }
    
    $filePath = [System.IO.Path]::GetFullPath((Join-Path $root $path.TrimStart('/')))
    
    if (-not $filePath.StartsWith($root + '\', [System.StringComparison]::OrdinalIgnoreCase) -or -not [System.IO.File]::Exists($filePath)) {
        $response.StatusCode = 404
        $response.ContentType = 'text/plain'
        $errBytes = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
        $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        $response.Close()
        continue
    }
    
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $ext = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
    $ct = switch ($ext) {
        '.html' { 'text/html; charset=utf-8' }
        '.css' { 'text/css; charset=utf-8' }
        '.js' { 'application/javascript; charset=utf-8' }
        '.png' { 'image/png' }
        '.jpg' { 'image/jpeg' }
        '.jpeg' { 'image/jpeg' }
        default { 'application/octet-stream' }
    }
    $response.StatusCode = 200
    $response.ContentType = $ct
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.Close()
}
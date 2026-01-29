$ErrorActionPreference = 'Stop'

$exclude = @('node_modules', '.git', '.output', 'dist', 'reports')
$files = Get-ChildItem -Recurse -File -Path .
foreach ($folder in $exclude) {
  $files = $files | Where-Object { $_.FullName -notmatch [regex]::Escape("\$folder\") }
}

$pattern = '(TODO|FIXME|BUG|HACK|NOTE|OPTIMIZE|PERF|SECURITY)'
$tagParse = '(TODO|FIXME|BUG|HACK|NOTE|OPTIMIZE|PERF|SECURITY)(?:\[(?<meta>[^\]]+)\])?:?\s?(?<text>.*)?'
$results = @()
$jsonResults = @()

$lineMatches = $files | Select-String -Pattern $pattern
foreach ($match in $lineMatches) {
  $results += "$($match.Path):$($match.LineNumber):$($match.Line)"

  $tag = $null
  $meta = @{}
  $text = $match.Line
  $matchResult = [regex]::Match($match.Line, $tagParse)
  if ($matchResult.Success) {
    $tag = $matchResult.Groups[1].Value
    $text = $matchResult.Groups['text'].Value
    $metaRaw = $matchResult.Groups['meta'].Value
    if ($metaRaw) {
      foreach ($entry in $metaRaw -split ',') {
        $parts = $entry -split '='
        if ($parts.Length -eq 2) {
          $key = $parts[0].Trim()
          $value = $parts[1].Trim()
          if ($key -and $value) {
            $meta[$key] = $value
          }
        }
      }
    }
  }

  $jsonResults += [pscustomobject]@{
    file = $match.Path
    line = $match.LineNumber
    tag  = $tag
    meta = $meta
    text = $text
    raw  = $match.Line
  }
}

$reportDir = Join-Path -Path (Get-Location) -ChildPath 'reports'
if (-not (Test-Path -Path $reportDir)) {
  New-Item -ItemType Directory -Path $reportDir | Out-Null
}
$reportPath = Join-Path -Path $reportDir -ChildPath 'todo-tree.md'
$results | Sort-Object | Set-Content -Path $reportPath -Encoding utf8

$jsonPath = Join-Path -Path $reportDir -ChildPath 'todo-tree.json'
$jsonResults | ConvertTo-Json -Depth 6 | Set-Content -Path $jsonPath -Encoding utf8

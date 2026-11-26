# Package a PA worktree. Example:
# powershell.exe -NoProfile -File .\PAs_Archive\package-pa.ps1 -Assignment PA2 -Total 96
# Add -DryRun to preview. The result is a folder; zip it yourself.

param(
    [Parameter(Mandatory)]
    [ValidatePattern('^PA[1-9][0-9]*$')]
    [string]$Assignment,

    [Parameter(Mandatory)]
    [ValidateRange(0, 100)]
    [int]$Total,

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$Assignment = $Assignment.ToUpperInvariant()

$archiveRoot = [System.IO.Path]::GetFullPath($PSScriptRoot)
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $archiveRoot '..'))
$repoPrefix = $repoRoot.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar

$gitRoot = (& git -C $repoRoot rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0 -or [System.IO.Path]::GetFullPath($gitRoot) -ne $repoRoot) {
    throw 'The script must live in the repository PAs_Archive directory.'
}

$gitDirectory = Join-Path $repoRoot '.git'
if (-not (Test-Path -LiteralPath $gitDirectory -PathType Container)) {
    throw 'A .git directory is required for this submission package.'
}

$readme = [System.IO.File]::ReadAllText((Join-Path $repoRoot 'README.md'))
$groupSection = [regex]::Match($readme, '(?ms)^## Group members?\s*\r?\n(.*?)(?=^## |\z)')
if (-not $groupSection.Success) {
    throw 'Expected a Group member(s) section in README.md.'
}
$members = [regex]::Matches($groupSection.Groups[1].Value, '(?m)^-\s*(\d{8})\s+-\s+.+$')
$studentIds = @($members | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique)
if ($studentIds.Count -lt 1 -or $studentIds.Count -gt 3) {
    throw 'Expected one to three student IDs in README.md.'
}

$report = [System.IO.File]::ReadAllText((Join-Path $repoRoot 'SELF_ASSESSMENT_REPORT.md'))
$assignmentMatch = [regex]::Match($report, '(?m)^#\s*Self-assessment\b[^\r\n]*\bPA#?(\d+)\s*$')
$scoreMatch = [regex]::Match($report, '(?m)^\*{0,2}Total(?: we claim)?:\s*(\d+)\s*/\s*100\.?\*{0,2}\s*$')
if (-not $assignmentMatch.Success -or "PA$($assignmentMatch.Groups[1].Value)" -ne $Assignment) {
    throw "SELF_ASSESSMENT_REPORT.md must identify $Assignment."
}
if (-not $scoreMatch.Success -or [int]$scoreMatch.Groups[1].Value -ne $Total) {
    throw "SELF_ASSESSMENT_REPORT.md must claim $Total / 100."
}

$folderName = ($studentIds -join '-') + '_' + $Total
$assignmentDirectory = [System.IO.Path]::GetFullPath((Join-Path $archiveRoot $Assignment))
$destination = [System.IO.Path]::GetFullPath((Join-Path $assignmentDirectory $folderName))
$archivePrefix = $archiveRoot.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
if (-not $destination.StartsWith($archivePrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'The package destination must stay inside PAs_Archive.'
}
if (-not $DryRun -and (Test-Path -LiteralPath $destination)) {
    throw "Package folder already exists: $destination. Review it before running again."
}

$paths = @(& git -C $repoRoot -c core.quotePath=false ls-files --cached --others --exclude-standard)
if ($LASTEXITCODE -ne 0) {
    throw 'Could not list Git worktree files.'
}

$selected = [System.Collections.Generic.List[object]]::new()
foreach ($relativePath in $paths) {
    if ([string]::IsNullOrWhiteSpace($relativePath)) { continue }

    $normalized = $relativePath.Replace('\', '/')
    $topLevel = $normalized.Split('/')[0]
    if ($topLevel -in @('project-docs', 'PAs_Archive', 'PAs-Archive')) { continue }

    $fileName = [System.IO.Path]::GetFileName($normalized)
    if ($fileName -eq '.env' -or ($fileName -like '.env.*' -and $fileName -ne '.env.example')) {
        continue
    }

    & git -C $repoRoot check-ignore --no-index --quiet -- $relativePath
    if ($LASTEXITCODE -eq 0) { continue }
    if ($LASTEXITCODE -ne 1) { throw "Could not check ignore rules for $relativePath" }

    $source = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $relativePath))
    if (-not $source.StartsWith($repoPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "File escapes the repository: $relativePath"
    }
    $item = Get-Item -LiteralPath $source -Force
    if ($item.PSIsContainer -or ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) {
        throw "Expected a regular file: $relativePath"
    }
    $selected.Add([pscustomobject]@{ Relative = $relativePath; Source = $source })
}

if ($DryRun) {
    Write-Host "Would create $destination"
    Write-Host "Would copy $($selected.Count) non-ignored worktree files and the .git directory."
    return
}

New-Item -ItemType Directory -Path $assignmentDirectory -Force | Out-Null
New-Item -ItemType Directory -Path $destination | Out-Null
foreach ($file in $selected) {
    $target = Join-Path $destination $file.Relative
    $parent = Split-Path -Parent $target
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
    Copy-Item -LiteralPath $file.Source -Destination $target
}

Copy-Item -LiteralPath $gitDirectory -Destination (Join-Path $destination '.git') -Recurse -Force
if (-not (Test-Path -LiteralPath (Join-Path $destination '.git\HEAD') -PathType Leaf)) {
    throw 'The package is incomplete: .git/HEAD is missing.'
}

Write-Host "Created $destination"
Write-Host "Copied $($selected.Count) non-ignored worktree files and the .git directory."
Write-Host 'Review the folder, then zip it with the same folder name.'

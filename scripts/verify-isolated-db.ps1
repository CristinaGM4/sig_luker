# Verificación desechable de SIG-LUKER. Requiere PowerShell 7 y Docker Linux.
param([string]$MicrozonificationPath)
$ErrorActionPreference = 'Stop'
$project = 'sig-verify-' + [guid]::NewGuid().ToString('N').Substring(0, 12)
$container = "$project-db"
$network = "${project}_default"
$variables = 'POSTGRES_TEST_PASSWORD', 'POSTGRES_TEST_PORT', 'DATABASE_URL', 'DATABASE_TEST_URL', 'SIG_IMPORT_DATABASE_URL', 'IBITE_PLAN_DATABASE_URL'
$previous = @{}
foreach ($variable in $variables) {
  $previous[$variable] = [Environment]::GetEnvironmentVariable($variable, 'Process')
}
$created = $false
Push-Location (Join-Path $PSScriptRoot '..')
try {
  $engine = docker info --format '{{.OSType}}'
  if ($LASTEXITCODE -ne 0 -or $engine -ne 'linux') {
    throw 'Se requiere un motor Docker Linux disponible'
  }

  $env:POSTGRES_TEST_PASSWORD = [guid]::NewGuid().ToString('N')
  $env:POSTGRES_TEST_PORT = '0'
  docker compose -p $project -f compose.test.yaml run --rm -d --service-ports --name $container db-test
  if ($LASTEXITCODE -ne 0) { throw 'No inició el contenedor desechable' }
  $created = $true

  $published = docker port $container 5432/tcp
  if ($LASTEXITCODE -ne 0 -or $published -notmatch '^127\.0\.0\.1:[0-9]{1,5}$') {
    throw 'La base de pruebas no quedó vinculada exclusivamente a localhost'
  }
  $ready = $false
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    docker exec $container pg_isready -h 127.0.0.1 -U sig_test -d sig_test -q
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Seconds 2
  }
  if (-not $ready) { throw 'PostgreSQL no alcanzó el estado listo' }

  $env:DATABASE_URL = "postgresql://sig_test:$($env:POSTGRES_TEST_PASSWORD)@${published}/sig_test?schema=public"
  $env:DATABASE_TEST_URL = $env:DATABASE_URL
  npm run db:migrate
  if ($LASTEXITCODE -ne 0) { throw 'Falló la primera aplicación de migraciones' }
  npm run db:migrate
  if ($LASTEXITCODE -ne 0) { throw 'Falló la segunda aplicación de migraciones' }
  node node_modules/prisma/build/index.js migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
  if ($LASTEXITCODE -ne 0) { throw 'La base no coincide con el esquema' }

  foreach ($probe in @('test/db/identity-catalogs-smoke.sql', 'test/db/postgis-smoke.sql')) {
    Get-Content -Raw -LiteralPath $probe | docker exec -i $container psql -U sig_test -d sig_test
    if ($LASTEXITCODE -ne 0) { throw "Falló la prueba SQL $probe" }
  }

  npm test
  if ($LASTEXITCODE -ne 0) { throw 'Falló la batería Node.js' }
  if ($MicrozonificationPath) {
    $env:SIG_IMPORT_DATABASE_URL = $env:DATABASE_TEST_URL
    foreach ($expected in @(139, 0)) {
      $plan = node scripts/import-sig-microzonification.mjs $MicrozonificationPath --plan
      if ($LASTEXITCODE -ne 0) { throw 'Falló el plan de solo lectura de microzonificación' }
      $planSummary = $plan | ConvertFrom-Json
      if ($planSummary.pending -ne $expected -or $planSummary.inserted -ne 0 -or $planSummary.total -ne 139) {
        throw 'El plan de microzonificación no coincide con el inventario'
      }
      $load = node scripts/import-sig-microzonification.mjs $MicrozonificationPath --apply
      if ($LASTEXITCODE -ne 0) { throw 'Falló la carga aislada de microzonificación' }
      $summary = $load | ConvertFrom-Json
      if ($summary.inserted -ne $expected -or $summary.total -ne 139) {
        throw 'La carga de microzonificación no coincide con el inventario'
      }
      Write-Output "Microzonificación: $($summary.inserted) inserciones, $($summary.total) geometrías."
    }
    $counts = docker exec $container psql -XAt -U sig_test -d sig_test -c 'SELECT zone, count(*) FROM microzonification_zones GROUP BY zone ORDER BY zone'
    if ($LASTEXITCODE -ne 0 -or ($counts -join ',') -ne 'A|33,B|98,P|7,T|1') {
      throw 'La distribución de zonas difiere del inventario'
    }
  }
  node scripts/verify-ibite-demo.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Falló el ensayo de la demo IBITE en procesos separados' }
  Get-Content -Raw -LiteralPath 'test/db/restore-fixtures.sql' | docker exec -i $container psql -U sig_test -d sig_test
  if ($LASTEXITCODE -ne 0) { throw 'Falló la preparación sintética de recuperación' }
  docker exec $container pg_dump -U sig_test -d sig_test --format=custom --file=/tmp/sig-verify.dump
  if ($LASTEXITCODE -ne 0) { throw 'Falló el respaldo de la base sintética' }
  docker exec $container createdb -U sig_test --template=template0 sig_restore_verify
  if ($LASTEXITCODE -ne 0) { throw 'Falló la creación de la base de restauración desechable' }
  docker exec $container pg_restore -U sig_test -d sig_restore_verify --exit-on-error --single-transaction /tmp/sig-verify.dump
  if ($LASTEXITCODE -ne 0) { throw 'Falló la restauración del respaldo sintético' }
  $restoreCheck = Get-Content -Raw -LiteralPath 'test/db/restore-check.sql'
  $baseline = $restoreCheck | docker exec -i $container psql -XAt -U sig_test -d sig_test
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo verificar la base sintética de origen' }
  $restored = $restoreCheck | docker exec -i $container psql -XAt -U sig_test -d sig_restore_verify
  if ($LASTEXITCODE -ne 0 -or ($baseline -join "`n") -cne ($restored -join "`n")) {
    throw 'La restauración difiere de la base sintética de origen'
  }
  if ($baseline.Count -ne 8 -or -not ($baseline -match '^mtts\|1\|') -or
      -not ($baseline -match '^factibilidad\|1\|') -or
      -not ($baseline -match '^aplicaciones\|[1-9][0-9]*\|') -or
      -not ($baseline -match '^resultados\|[1-9][0-9]*\|')) {
    throw 'El respaldo no contiene las comprobaciones requeridas'
  }
  Write-Output 'Respaldo y restauración sintéticos verificados.'
  $report = node scripts/plan-ibite-pilot.mjs QA-PERIODO-INEXISTENTE
  if ($LASTEXITCODE -ne 2) { throw 'La preparación IBITE debe detectar el periodo inexistente' }
  $plan = $report | ConvertFrom-Json
  if ($plan.entries.Count -ne 0 -or $plan.blockers[0].reason -ne 'period_not_found') {
    throw 'La preparación IBITE no identificó el bloqueo esperado'
  }
  $env:IBITE_PLAN_DATABASE_URL = $env:DATABASE_TEST_URL
  $operator = [guid]::NewGuid().ToString()
  $deploymentReport = node scripts/plan-ibite-pilot.mjs QA-PERIODO-INEXISTENTE $operator --deployment-plan
  if ($LASTEXITCODE -ne 2) { throw 'Falló el plan de despliegue IBITE de solo lectura' }
  $deployment = $deploymentReport | ConvertFrom-Json
  if (-not $deployment.operatorChecked -or 'operator_not_authorized' -notin $deployment.blockers.reason -or
      'period_not_found' -notin $deployment.blockers.reason -or $deployment.entries.Count -ne 0) {
    throw 'El plan de despliegue IBITE no identificó los bloqueos esperados'
  }
  npm run lint
  if ($LASTEXITCODE -ne 0) { throw 'Falló ESLint' }
  npm run format:check
  if ($LASTEXITCODE -ne 0) { throw 'Falló Prettier' }
} finally {
  if ($created) {
    docker stop $container | Out-Null
  }
  $label = docker network inspect --format '{{index .Labels "com.docker.compose.project"}}' $network 2>$null
  if ($LASTEXITCODE -eq 0 -and $label -eq $project) {
    docker network rm $network | Out-Null
  }
  foreach ($variable in $variables) {
    [Environment]::SetEnvironmentVariable($variable, $previous[$variable], 'Process')
  }
  Pop-Location
}

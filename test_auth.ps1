# Script PowerShell pour tester l'authentification et les permissions
# Usage: .\test_auth.ps1

Write-Host "=== Test d'authentification Staff ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000/api"

# Test 1: Connexion Admin
Write-Host "Test 1: Connexion Admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@test.com"
    password = "password"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/staff/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    
    if ($loginResponse.success) {
        Write-Host "✓ Connexion réussie" -ForegroundColor Green
        Write-Host "  Utilisateur: $($loginResponse.user.name)" -ForegroundColor Gray
        Write-Host "  Rôle: $($loginResponse.user.role)" -ForegroundColor Gray
        $token = $loginResponse.token
        Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Write-Host "✗ Échec de connexion" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Erreur de connexion: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Diagnostic d'authentification
Write-Host "Test 2: Diagnostic d'authentification..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Accept" = "application/json"
    }
    
    $diagResponse = Invoke-RestMethod -Uri "$baseUrl/diagnostic/auth" `
        -Method Get `
        -Headers $headers
    
    if ($diagResponse.success) {
        Write-Host "✓ Diagnostic OK" -ForegroundColor Green
        Write-Host "  Type: $($diagResponse.diagnostic.user_class)" -ForegroundColor Gray
        Write-Host "  Email: $($diagResponse.diagnostic.user_email)" -ForegroundColor Gray
        Write-Host "  Rôle: $($diagResponse.diagnostic.role_info.nom_role)" -ForegroundColor Gray
        Write-Host "  Actif: $($diagResponse.diagnostic.actif)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Diagnostic échoué" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Erreur diagnostic: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Accès à la liste des utilisateurs
Write-Host "Test 3: Accès à la liste des utilisateurs..." -ForegroundColor Yellow
try {
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/admin/users" `
        -Method Get `
        -Headers $headers
    
    if ($usersResponse.success) {
        Write-Host "✓ Accès autorisé" -ForegroundColor Green
        $userCount = if ($usersResponse.data) { $usersResponse.data.Count } else { 0 }
        Write-Host "  Nombre d'utilisateurs: $userCount" -ForegroundColor Gray
        
        if ($usersResponse.meta) {
            Write-Host "  Total: $($usersResponse.meta.total)" -ForegroundColor Gray
            Write-Host "  Page: $($usersResponse.meta.current_page)/$($usersResponse.meta.last_page)" -ForegroundColor Gray
        }
    } else {
        Write-Host "✗ Accès refusé: $($usersResponse.message)" -ForegroundColor Red
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✗ Erreur 401: Non authentifié" -ForegroundColor Red
    } elseif ($statusCode -eq 403) {
        Write-Host "✗ Erreur 403: Accès refusé (permissions insuffisantes)" -ForegroundColor Red
    } else {
        Write-Host "✗ Erreur $statusCode : $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Tests terminés ===" -ForegroundColor Cyan
Write-Host ""

# Test 4: Test avec Employé
Write-Host "Test 4: Connexion Employé..." -ForegroundColor Yellow
$employeeLoginBody = @{
    email = "employee@test.com"
    password = "password"
} | ConvertTo-Json

try {
    $employeeLoginResponse = Invoke-RestMethod -Uri "$baseUrl/staff/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $employeeLoginBody
    
    if ($employeeLoginResponse.success) {
        Write-Host "✓ Connexion employé réussie" -ForegroundColor Green
        Write-Host "  Rôle: $($employeeLoginResponse.user.role)" -ForegroundColor Gray
        
        $employeeToken = $employeeLoginResponse.token
        $employeeHeaders = @{
            "Authorization" = "Bearer $employeeToken"
            "Accept" = "application/json"
        }
        
        # Tester l'accès admin avec le compte employé
        try {
            $employeeUsersResponse = Invoke-RestMethod -Uri "$baseUrl/admin/users" `
                -Method Get `
                -Headers $employeeHeaders
            
            if ($employeeUsersResponse.success) {
                Write-Host "✓ Employé a accès aux routes admin" -ForegroundColor Green
            }
        } catch {
            Write-Host "✗ Employé n'a pas accès aux routes admin" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "✗ Erreur de connexion employé: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Résumé:" -ForegroundColor Cyan
Write-Host "- Si tous les tests sont ✓, l'authentification fonctionne correctement" -ForegroundColor Gray
Write-Host "- Si des tests sont ✗, consultez CORRECTION_ERREURS_401_403.md" -ForegroundColor Gray

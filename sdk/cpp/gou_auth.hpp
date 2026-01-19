/*
 * GOU Auth SDK - C++ Header
 * Sistema de Autenticação para clientes C++
 */

#pragma once

#include <string>
#include <functional>
#include <memory>

namespace GouAuth {

// Forward declarations
class AuthClient;

// ==================== Structures ====================

struct User {
    std::string id;
    std::string username;
    std::string email;
    std::string subscriptionExpires;
    std::string keyType;
};

struct AuthResult {
    bool success;
    std::string token;
    std::string sessionId;
    std::string expiresAt;
    User user;
    
    // Error info (if success = false)
    std::string errorCode;
    std::string errorMessage;
};

struct SessionValidation {
    bool valid;
    User user;
    std::string sessionExpiresAt;
};

// ==================== Auth Client Class ====================

class AuthClient {
public:
    /**
     * Constructor
     * @param appId Your application ID from the admin panel
     * @param apiUrl API base URL (default: http://localhost:3001)
     */
    AuthClient(const std::string& appId, const std::string& apiUrl = "http://localhost:3001");
    
    ~AuthClient();

    /**
     * Login with username and password
     * @param username User's username
     * @param password User's password
     * @return AuthResult with token and user info on success
     */
    AuthResult Login(const std::string& username, const std::string& password);
    
    /**
     * Login with license key
     * @param key License key (format: GOU-XXXX-XXXX-XXXX)
     * @return AuthResult with token and user info on success
     */
    AuthResult LoginWithKey(const std::string& key);
    
    /**
     * Validate current session
     * @return SessionValidation with current session status
     */
    SessionValidation ValidateSession();
    
    /**
     * Logout and end current session
     * @return true if logout was successful
     */
    bool Logout();
    
    /**
     * Check if currently authenticated
     * @return true if authenticated and session is valid
     */
    bool IsAuthenticated();
    
    /**
     * Get current user info
     * @return User struct (empty if not authenticated)
     */
    User GetUser() const;
    
    /**
     * Get current auth token
     * @return JWT token string (empty if not authenticated)
     */
    std::string GetToken() const;

private:
    class Impl;
    std::unique_ptr<Impl> m_impl;
    
    std::string m_appId;
    std::string m_apiUrl;
    std::string m_token;
    std::string m_sessionId;
    User m_user;
    
    std::string GenerateHWID();
    std::string HttpRequest(const std::string& method, const std::string& endpoint, 
                            const std::string& body = "", bool auth = false);
};

// ==================== HWID Utilities ====================

namespace HWID {
    /**
     * Generate unique hardware ID
     * Combines: CPU ID + Disk Serial + MAC Address
     * @return SHA256 hash of hardware identifiers
     */
    std::string Generate();
    
    /**
     * Get CPU identifier
     */
    std::string GetCPUID();
    
    /**
     * Get primary disk serial
     */
    std::string GetDiskSerial();
    
    /**
     * Get MAC address
     */
    std::string GetMACAddress();
}

} // namespace GouAuth


// ==================== Example Usage ====================
/*
#include "gou_auth.hpp"
#include <iostream>

int main() {
    // Initialize client
    GouAuth::AuthClient auth("your-app-id", "http://localhost:3001");
    
    // Login with credentials
    auto result = auth.Login("username", "password");
    
    if (result.success) {
        std::cout << "Logged in as: " << result.user.username << std::endl;
        std::cout << "Expires: " << result.user.subscriptionExpires << std::endl;
        
        // Validate session periodically
        if (auth.IsAuthenticated()) {
            std::cout << "Session is valid!" << std::endl;
        }
        
        // Logout when done
        auth.Logout();
    } else {
        std::cout << "Error: " << result.errorMessage << std::endl;
        std::cout << "Code: " << result.errorCode << std::endl;
    }
    
    // Or login with key
    auto keyResult = auth.LoginWithKey("GOU-XXXX-XXXX-XXXX");
    
    if (keyResult.success) {
        std::cout << "Key activated!" << std::endl;
    }
    
    return 0;
}
*/

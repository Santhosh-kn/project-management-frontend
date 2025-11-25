export interface User { 
    id: number 
    name: string 
    email: string 
    role: \"admin\" | \"manager\" | \"member\" | \"guest\" 
    is_active: boolean 
    created_at: string 
    updated_at: string 
} 
export interface LoginCredentials { 
    email: string 
    password: string 
} 
export interface RegisterData { 
    name: string 
    email: string 
    password: string 
    password_confirmation: string 
} 
export interface AuthResponse { 
    success: boolean 
    data: { 
        user: User 
        token: string 
        refresh_token: string 
    } 
    message: string 
}
import { LoginService } from '../users/login.service';
import { LoginDto } from './dto/login.dto';
export declare class LoginController {
    private readonly loginService;
    constructor(loginService: LoginService);
    getHello(): string;
    loginUser(loginData: LoginDto): Promise<{
        success: boolean;
        message: string;
        user: any;
    }>;
}

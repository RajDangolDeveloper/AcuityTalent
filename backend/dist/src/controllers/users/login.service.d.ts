import { LoginDto } from '../auth/dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class LoginService {
    private prisma;
    constructor(prisma: PrismaService);
    getHello(): string;
    validateUser(loginDto: LoginDto): Promise<any>;
}

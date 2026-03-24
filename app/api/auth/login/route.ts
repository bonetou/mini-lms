import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/auth-context";
import { AuthController } from "@/lib/modules/auth/controller";
import { AuthRepository, AuthAdminRepository } from "@/lib/modules/auth/repository";
import { AuthService } from "@/lib/modules/auth/service";

export async function POST(request: NextRequest) {
  return withApiHandler(request, async (routeClient) => {
    const repository = new AuthRepository(routeClient.supabase);
    const adminRepository = new AuthAdminRepository();
    const service = new AuthService(repository, adminRepository);
    const controller = new AuthController(service);

    return controller.login(request);
  });
}

export class UserResponseDto {
  id: number;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  deletedAt: Date | null;
  faculty?: {
    id: number;
    name: string;
    department: { id: number; name: string };
  };
}
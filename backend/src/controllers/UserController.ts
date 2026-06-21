import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { logger } from '../utils/logger';

// Convert MySQL ER_DUP_ENTRY into a friendly message.
// The raw message looks like: Duplicate entry 'x@y.com' for key 'users.IDX_97672ac88f789774dd47f7c8be'
function parseDuplicateEntry(error: unknown): string | null {
  const raw = error instanceof Error ? error.message : String(error);
  if (!raw.toLowerCase().includes('duplicate entry')) return null;

  // Map known index names to readable field labels
  const indexMap: Record<string, string> = {
    email:   'Email',
    aadhaar: 'Aadhaar number',
    pan:     'PAN',
  };

  for (const [key, label] of Object.entries(indexMap)) {
    if (raw.toLowerCase().includes(key)) {
      return `${label} already exists`;
    }
  }

  return 'A unique field already exists';
}

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      const duplicate = parseDuplicateEntry(error);
      const msg = error instanceof Error ? error.message : 'Failed to create user';

      if (duplicate) {
        res.status(400).json({ success: false, message: duplicate });
      } else if (msg.includes('already exists') || msg.includes('Validation failed')) {
        res.status(400).json({ success: false, message: msg });
      } else {
        logger.error('Create user error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      res.json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      const duplicate = parseDuplicateEntry(error);
      const msg = error instanceof Error ? error.message : 'Failed to update user';

      if (duplicate) {
        res.status(400).json({ success: false, message: duplicate });
      } else if (msg === 'User not found') {
        res.status(404).json({ success: false, message: msg });
      } else if (msg.includes('already exists') || msg.includes('Validation failed')) {
        res.status(400).json({ success: false, message: msg });
      } else {
        logger.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch user';
      
      if (msg === 'User not found') {
        res.status(404).json({ success: false, message: msg });
      } else {
        logger.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const order = (req.query.order as 'ASC' | 'DESC') || 'DESC';
      const search = req.query.search as string;

      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({ success: false, message: 'Invalid pagination parameters' });
        return;
      }

      const result = await this.userService.getAllUsers({ page, limit, sortBy, order, search });

      res.json({
        success: true,
        message: 'Users fetched successfully',
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
          hasPreviousPage: result.hasPreviousPage,
        },
      });
    } catch (error) {
      logger.error('Get all users error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.userService.deleteUser(req.params.id);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to delete user';
      
      if (msg === 'User not found') {
        res.status(404).json({ success: false, message: msg });
      } else {
        logger.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  restoreUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.restoreUser(req.params.id);
      res.json({
        success: true,
        message: 'User restored successfully',
        data: user,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to restore user';
      
      if (msg === 'User not found' || msg === 'User is not deleted') {
        res.status(404).json({ success: false, message: msg });
      } else {
        logger.error('Restore user error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  getUserStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.userService.getUserStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      logger.error('Get user stats error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
}

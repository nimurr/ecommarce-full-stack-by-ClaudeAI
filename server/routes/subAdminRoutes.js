import express from 'express';
import {
  getSubAdmins,
  getSubAdmin,
  createSubAdmin,
  updateSubAdmin,
  deleteSubAdmin,
  updatePermissions,
  toggleStatus,
} from '../controllers/subAdminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin role (sub-admins cannot manage other sub-admins)
router.use(protect);
router.use(authorize('admin'));

router.get('/', getSubAdmins);
router.get('/:id', getSubAdmin);
router.post('/', createSubAdmin);
router.put('/:id', updateSubAdmin);
router.delete('/:id', deleteSubAdmin);
router.put('/:id/permissions', updatePermissions);
router.put('/:id/status', toggleStatus);

export default router;

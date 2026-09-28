import { Router, Request, Response } from 'express';
import { processCharge, setSystemErrorMode, getSystemErrorMode } from '../services/snailpay.service';
import { SnailPayChargeRequest } from '../types/snailpay.types';

const router = Router();

/**
 * POST /api/snailpay/charge
 * Procesa un cobro simulado.
 */
router.post('/charge', (req: Request, res: Response) => {
  const body = req.body as Partial<SnailPayChargeRequest>;

  // Validación de campos requeridos
  const required: (keyof SnailPayChargeRequest)[] = [
    'card_number', 'expiration_date', 'cvv', 'cardholder_name', 'amount', 'payer_id', 'payer_email',
  ];
  const missing = required.filter((k) => body[k] === undefined || body[k] === '');
  if (missing.length > 0) {
    return res.status(400).json({
      error: 'MISSING_FIELDS',
      message: `The following fields are required: ${missing.join(', ')}`,
    });
  }

  const result = processCharge(body as SnailPayChargeRequest);

  // HTTP 200 para approved y rejected (son respuestas de negocio esperadas)
  // HTTP 503 para errores del sistema
  const httpStatus = result.status === 'error' ? 503 : 200;
  return res.status(httpStatus).json(result);
});

/**
 * POST /api/snailpay/admin/system-error
 * Activa o desactiva el modo de error del sistema.
 * Body: { enabled: boolean }
 */
router.post('/admin/system-error', (req: Request, res: Response) => {
  const { enabled } = req.body as { enabled: boolean };
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'Field "enabled" must be a boolean.' });
  }
  setSystemErrorMode(enabled);
  return res.json({
    message: `System error mode is now ${enabled ? 'ENABLED' : 'DISABLED'}.`,
    system_error_active: getSystemErrorMode(),
  });
});

/**
 * GET /api/snailpay/admin/status
 * Consulta el estado actual del servicio.
 */
router.get('/admin/status', (_req: Request, res: Response) => {
  res.json({
    service: 'SnailPay',
    system_error_active: getSystemErrorMode(),
    status: getSystemErrorMode() ? 'degraded' : 'operational',
  });
});

export default router;

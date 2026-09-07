import { orderService } from "../services/orderService";

const orderUpdate = async (req, res, next) => {
  try {
    const order = await orderService.updateOrder(req.params.id, req.user.id);
    res.json({ success: true, order });
  } catch (e) {
    next(e);
  }
};

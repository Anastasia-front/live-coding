export async function refund(req, res, next) {
  try {
    const refund = await refundService(req.user, req.params.id);
    res.json({ message: "Refund processed successfully", refund });
  } catch (e) {
    next(e);
  }
}

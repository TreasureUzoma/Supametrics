export function getPaginationParams(c: any) {
  // qet query params with defaults
  const pageParam = c.req.query("page");
  const limitParam = c.req.query("limit");

  // ensure page >= 1 and limit >= 1
  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const limit = Math.max(
    1,
    Math.min(100, parseInt(limitParam || "20", 10) || 20)
  );

  // calculate offset
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

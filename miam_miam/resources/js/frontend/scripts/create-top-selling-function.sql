-- Create function to get top selling items
CREATE OR REPLACE FUNCTION get_top_selling_items(limit_count INT DEFAULT 5)
RETURNS TABLE (
  id UUID,
  name TEXT,
  total_quantity BIGINT,
  total_revenue BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mi.id,
    mi.name,
    SUM(oi.quantity) as total_quantity,
    SUM(oi.price * oi.quantity) as total_revenue
  FROM menu_items mi
  JOIN order_items oi ON mi.id = oi."menuItemId"
  JOIN orders o ON oi."orderId" = o.id
  WHERE o.status IN ('completed', 'ready', 'preparing')
  GROUP BY mi.id, mi.name
  ORDER BY total_quantity DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

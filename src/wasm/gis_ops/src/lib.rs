use wasm_bindgen::prelude::*;
use geo::{Point, LineString, Polygon, algorithm::*};
use serde::{Serialize, Deserialize};

#[wasm_bindgen]
pub struct GisOps;

#[derive(Serialize, Deserialize)]
pub struct PointData {
    x: f64,
    y: f64
}

#[wasm_bindgen]
impl GisOps {
    // 计算两点之间的距离
    pub fn calculate_distance(point1: &JsValue, point2: &JsValue) -> f64 {
        let p1: PointData = point1.into_serde().unwrap();
        let p2: PointData = point2.into_serde().unwrap();
        
        let point1 = Point::new(p1.x, p1.y);
        let point2 = Point::new(p2.x, p2.y);
        
        point1.euclidean_distance(&point2)
    }

    // 计算多边形面积
    pub fn calculate_area(polygon_points: &JsValue) -> f64 {
        let points: Vec<PointData> = polygon_points.into_serde().unwrap();
        let coords: Vec<(f64, f64)> = points.iter()
            .map(|p| (p.x, p.y))
            .collect();
        
        let polygon = Polygon::new(LineString::from(coords), vec![]);
        polygon.unsigned_area()
    }

    // 判断点是否在多边形内
    pub fn point_in_polygon(point: &JsValue, polygon_points: &JsValue) -> bool {
        let p: PointData = point.into_serde().unwrap();
        let points: Vec<PointData> = polygon_points.into_serde().unwrap();
        
        let point = Point::new(p.x, p.y);
        let coords: Vec<(f64, f64)> = points.iter()
            .map(|p| (p.x, p.y))
            .collect();
        
        let polygon = Polygon::new(LineString::from(coords), vec![]);
        polygon.contains(&point)
    }

    // 计算缓冲区
    pub fn calculate_buffer(points: &JsValue, distance: f64) -> JsValue {
        let input_points: Vec<PointData> = points.into_serde().unwrap();
        let coords: Vec<(f64, f64)> = input_points.iter()
            .map(|p| (p.x, p.y))
            .collect();
        
        let line = LineString::from(coords);
        let buffered = line.buffer(distance);
        
        let result: Vec<PointData> = buffered.exterior()
            .points()
            .map(|p| PointData { x: p.x(), y: p.y() })
            .collect();
            
        JsValue::from_serde(&result).unwrap()
    }
} 
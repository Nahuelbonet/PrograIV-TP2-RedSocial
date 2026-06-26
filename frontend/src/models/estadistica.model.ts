// Formato único que devuelven las 3 rutas de estadísticas del backend.
export interface PuntoEstadistica {
  etiqueta: string; // qué se muestra (nombre de usuario, fecha o título)
  cantidad: number; // el valor numérico (alto de barra, porción, punto)
}

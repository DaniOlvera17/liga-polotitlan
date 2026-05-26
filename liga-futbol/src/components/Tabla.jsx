export default function Tabla({ columnas, datos, emptyMsg = 'Sin datos' }) {
  return (
    <div className="tabla-wrap">
      <table className="tabla">
        <thead>
          <tr>
            {columnas.map(col => (
              <th key={col.key} style={{ textAlign: col.align ?? 'left' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.length === 0 ? (
            <tr>
              <td colSpan={columnas.length} style={{ textAlign: 'center', color: 'var(--text-light)', padding: '32px 0' }}>
                {emptyMsg}
              </td>
            </tr>
          ) : (
            datos.map((fila, i) => (
              <tr key={fila.id ?? i}>
                {columnas.map(col => (
                  <td key={col.key} style={{ textAlign: col.align ?? 'left' }}>
                    {col.render ? col.render(fila) : fila[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

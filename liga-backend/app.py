# app.py — Liga Polotitlán API (Docker / PyMySQL)
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import pymysql.cursors

app = Flask(__name__)
CORS(app)

# ─── Conexión — usa variables de entorno en producción ───
def get_connection():
    return pymysql.connect(
        host     = os.environ.get('DB_HOST', 'localhost'),
        user     = os.environ.get('DB_USER', 'root'),
        password = os.environ.get('DB_PASS', ''),
        database = os.environ.get('DB_NAME', 'liga_polotitlan'),
        charset  = 'utf8mb4',
        cursorclass = pymysql.cursors.DictCursor
    )

# ─── TORNEOS ───
@app.route('/torneos', methods=['GET'])
def get_torneos():
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("SELECT id_torneo AS id, nombre, categoria, temporada, estado, anio FROM torneo")
        rows = cur.fetchall()
    conn.close()
    return jsonify(rows)

@app.route('/torneos', methods=['POST'])
def crear_torneo():
    d = request.get_json()
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO torneo (nombre, categoria, temporada, estado, anio) VALUES (%s,%s,%s,%s,%s)",
            (d['nombre'], d.get('categoria',''), d.get('temporada',''), d.get('estado','activo'), d.get('año',2026))
        )
        conn.commit()
        new_id = cur.lastrowid
    conn.close()
    return jsonify({**d, 'id': new_id}), 201

@app.route('/torneos/<int:id>', methods=['PUT'])
def actualizar_torneo(id):
    d = request.get_json()
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE torneo SET nombre=%s, categoria=%s, temporada=%s, estado=%s, anio=%s WHERE id_torneo=%s",
            (d['nombre'], d.get('categoria',''), d.get('temporada',''), d.get('estado','activo'), d.get('año',2026), id)
        )
        conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Torneo actualizado'})

@app.route('/torneos/<int:id>', methods=['DELETE'])
def eliminar_torneo(id):
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("DELETE FROM torneo WHERE id_torneo=%s", (id,))
        conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Torneo eliminado'})

# ─── EQUIPOS ───
@app.route('/equipos', methods=['GET'])
def get_equipos():
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT id_equipo AS id, nombre, id_torneo AS torneoId, color,
                   pj, pg, pe, pp, goles_favor AS golesFavor,
                   goles_contra AS golesContra, pts, id_delegado AS delegadoId
            FROM equipo
        """)
        rows = cur.fetchall()
    conn.close()
    return jsonify(rows)

@app.route('/equipos', methods=['POST'])
def crear_equipo():
    d = request.get_json()
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO equipo (nombre, id_torneo, color, id_delegado) VALUES (%s,%s,%s,%s)",
            (d['nombre'], d['torneoId'], d.get('color','#888888'), d.get('delegadoId'))
        )
        conn.commit()
        new_id = cur.lastrowid
    conn.close()
    return jsonify({**d, 'id': new_id, 'pj':0,'pg':0,'pe':0,'pp':0,'golesFavor':0,'golesContra':0,'pts':0}), 201

@app.route('/equipos/<int:id>', methods=['PUT'])
def actualizar_equipo(id):
    d = request.get_json()
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE equipo SET nombre=%s, id_torneo=%s, color=%s, pj=%s, pg=%s, pe=%s, pp=%s,
                   goles_favor=%s, goles_contra=%s, pts=%s, id_delegado=%s
            WHERE id_equipo=%s
        """, (d['nombre'], d['torneoId'], d.get('color','#888888'),
              d.get('pj',0), d.get('pg',0), d.get('pe',0), d.get('pp',0),
              d.get('golesFavor',0), d.get('golesContra',0), d.get('pts',0),
              d.get('delegadoId'), id))
        conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Equipo actualizado'})

@app.route('/equipos/<int:id>', methods=['DELETE'])
def eliminar_equipo(id):
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("DELETE FROM equipo WHERE id_equipo=%s", (id,))
        conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Equipo eliminado'})

# ─── JUGADORES ───
@app.route('/jugadores', methods=['GET'])
def get_jugadores():
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT id_jugador AS id, nombre, id_equipo AS equipoId,
                   posicion, numero, goles, amarillas, rojas
            FROM jugador
        """)
        rows = cur.fetchall()
    conn.close()
    return jsonify(rows)

@app.route('/jugadores', methods=['POST'])
def crear_jugador():
    d = request.get_json()
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO jugador (nombre, id_equipo, posicion, numero) VALUES (%s,%s,%s,%s)",
            (d['nombre'], d['equipoId'], d.get('posicion','Delantero'), d.get('numero',0))
        )
        conn.commit()
        new_id = cur.lastrowid
    conn.close()
    return jsonify({**d, 'id': new_id, 'goles':0,'amarillas':0,'rojas':0}), 201

@app.route('/jugadores/<int:id>', methods=['PUT'])
def actualizar_jugador(id):
    d = request.get_json()
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE jugador SET nombre=%s, id_equipo=%s, posicion=%s,
                   numero=%s, goles=%s, amarillas=%s, rojas=%s
            WHERE id_jugador=%s
        """, (d['nombre'], d['equipoId'], d.get('posicion','Delantero'),
              d.get('numero',0), d.get('goles',0), d.get('amarillas',0), d.get('rojas',0), id))
        conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Jugador actualizado'})

@app.route('/jugadores/<int:id>', methods=['DELETE'])
def eliminar_jugador(id):
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("DELETE FROM jugador WHERE id_jugador=%s", (id,))
        conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Jugador eliminado'})

# ─── PARTIDOS ───
@app.route('/partidos', methods=['GET'])
def get_partidos():
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT id_partido AS id, id_torneo AS torneoId, jornada,
                   id_local AS `local`, id_visitante AS visitante,
                   goles_local AS golesLocal, goles_visitante AS golesVisitante,
                   DATE_FORMAT(fecha,'%%Y-%%m-%%d') AS fecha, estado, tipo
            FROM partido
        """)
        partidos = cur.fetchall()
        cur.execute("SELECT id_partido, id_jugador AS jugadorId, goles, amarillas, rojas FROM anotador")
        anotadores = cur.fetchall()
    conn.close()
    amap = {}
    for a in anotadores:
        pid = a['id_partido']
        if pid not in amap:
            amap[pid] = []
        amap[pid].append({k:v for k,v in a.items() if k != 'id_partido'})
    for p in partidos:
        p['anotadores'] = amap.get(p['id'], [])
    return jsonify(partidos)

@app.route('/partidos', methods=['POST'])
def crear_partido():
    d = request.get_json()
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO partido (id_torneo, jornada, id_local, id_visitante, fecha, estado, tipo)
            VALUES (%s,%s,%s,%s,%s,'pendiente',%s)
        """, (d['torneoId'], d['jornada'], d['local'], d.get('visitante'),
              d.get('fecha'), d.get('tipo','regular')))
        conn.commit()
        new_id = cur.lastrowid
    conn.close()
    return jsonify({**d, 'id': new_id, 'estado':'pendiente',
                    'golesLocal':None,'golesVisitante':None,'anotadores':[]}), 201

@app.route('/partidos/<int:id>', methods=['PUT'])
def actualizar_partido(id):
    d = request.get_json()
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE partido SET id_torneo=%s, jornada=%s, id_local=%s, id_visitante=%s,
                   goles_local=%s, goles_visitante=%s, fecha=%s, estado=%s, tipo=%s
            WHERE id_partido=%s
        """, (d['torneoId'], d['jornada'], d['local'], d.get('visitante'),
              d.get('golesLocal'), d.get('golesVisitante'),
              d.get('fecha'), d.get('estado','pendiente'), d.get('tipo','regular'), id))
        conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Partido actualizado'})

@app.route('/partidos/<int:id>/resultado', methods=['PUT'])
def registrar_resultado(id):
    d = request.get_json()
    gl, gv = d['golesLocal'], d['golesVisitante']
    anots = d.get('anotadores', [])
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE partido SET goles_local=%s, goles_visitante=%s, estado='jugado' WHERE id_partido=%s",
            (gl, gv, id)
        )
        cur.execute("SELECT id_local, id_visitante FROM partido WHERE id_partido=%s", (id,))
        p = cur.fetchone()
        if p:
            def upd_equipo(eq_id, gf, gc):
                if not eq_id: return
                g = 1 if gf>gc else 0; e = 1 if gf==gc else 0; l = 1 if gf<gc else 0
                pts = 3 if gf>gc else (1 if gf==gc else 0)
                cur.execute("""
                    UPDATE equipo SET pj=pj+1,pg=pg+%s,pe=pe+%s,pp=pp+%s,
                           goles_favor=goles_favor+%s,goles_contra=goles_contra+%s,pts=pts+%s
                    WHERE id_equipo=%s
                """, (g,e,l,gf,gc,pts,eq_id))
            upd_equipo(p['id_local'], gl, gv)
            upd_equipo(p['id_visitante'], gv, gl)
        cur.execute("DELETE FROM anotador WHERE id_partido=%s", (id,))
        for a in anots:
            cur.execute(
                "INSERT INTO anotador (id_partido,id_jugador,goles,amarillas,rojas) VALUES (%s,%s,%s,%s,%s)",
                (id, a['jugadorId'], a.get('goles',0), a.get('amarillas',0), a.get('rojas',0))
            )
            cur.execute("""
                UPDATE jugador SET goles=goles+%s,amarillas=amarillas+%s,rojas=rojas+%s
                WHERE id_jugador=%s
            """, (a.get('goles',0), a.get('amarillas',0), a.get('rojas',0), a['jugadorId']))
        conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Resultado registrado'})

@app.route('/partidos/<int:id>', methods=['DELETE'])
def eliminar_partido(id):
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("DELETE FROM anotador WHERE id_partido=%s", (id,))
        cur.execute("DELETE FROM partido WHERE id_partido=%s", (id,))
        conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Partido eliminado'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False, port=8000)

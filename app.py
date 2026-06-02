import os
import mimetypes
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from utils.database import init_database, get_all_poets, log_analysis, get_stats
from utils.poem_analyzer import analyze

# 注册 webp MIME 类型
mimetypes.add_type('image/webp', '.webp')

app = Flask(__name__)
CORS(app)

# 初始化数据库（模块加载时执行，gunicorn 导入时也生效）
init_database()

# 获取 poetry 缓存（启动时加载一次）
_poets_cache = None


def get_poets():
    global _poets_cache
    if _poets_cache is None:
        _poets_cache = get_all_poets()
    return _poets_cache


@app.route('/')
def index():
    return render_template('index.html', poets=get_poets())


@app.route('/api/analyze', methods=['POST'])
def api_analyze():
    data = request.get_json(force=True)
    poem_text = data.get('poem', '').strip()

    if not poem_text:
        return jsonify({'error': '诗歌内容为空'}), 400
    if len(poem_text) < 15:
        return jsonify({'error': '诗歌内容太短，请至少输入15个字'}), 400
    if len(poem_text) > 5000:
        return jsonify({'error': '诗歌内容过长，请限制在5000字以内'}), 400

    poets = get_poets()
    result = analyze(poem_text, poets)

    ip = request.remote_addr or 'unknown'
    log_analysis(poem_text, result, ip)

    return jsonify(result)


@app.route('/api/stats', methods=['GET'])
def api_stats():
    stats = get_stats()
    return jsonify(stats)


@app.route('/api/poets', methods=['GET'])
def api_poets():
    return jsonify(get_poets())


def print_banner(host, port, mode):
    print(f"\n{'='*50}")
    print(f"诗人匹配测试网站已启动 ({mode})")
    print(f"本地访问: http://localhost:{port}")
    print(f"局域网访问: http://<本机IP>:{port}")
    print(f"{'='*50}")
    if mode == "waitress":
        print("外网访问: 运行 cloudflared.exe tunnel --url http://localhost:8080")
        print(f"{'='*50}\n")


if __name__ == '__main__':
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 8080))
    use_waitress = os.environ.get('WAITRESS', 'true').lower() == 'true'

    if use_waitress:
        from waitress import serve
        print_banner(host, port, "waitress")
        serve(app, host=host, port=port)
    else:
        debug = os.environ.get('DEBUG', 'false').lower() == 'true'
        print_banner(host, port, "Flask开发服务器")
        app.run(host=host, port=port, debug=debug)

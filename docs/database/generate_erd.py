"""Generate editable diagrams and SVGs from the repository migrations (stdlib only)."""
from pathlib import Path
import re
import html
import xml.etree.ElementTree as E

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
tables = {}
for path in sorted((ROOT / 'database/migrations').glob('*.php')):
    for name, body in re.findall(r"Schema::create\('([^']+)', function.*?\{(.*?)\n\s*\}\);", path.read_text(), re.S):
        cols = []
        for line in body.splitlines():
            m = re.search(r"\$table->(\w+)\((.*?)\)(.*);", line)
            if not m:
                continue
            typ, args, tail = m.groups()
            if typ == 'index':
                continue
            if typ == 'timestamps':
                cols.extend([('created_at', 'timestamp', '?'), ('updated_at', 'timestamp', '?')])
                continue
            if typ == 'rememberToken':
                cols.append(('remember_token', 'varchar(100)', '?'))
                continue
            if typ == 'morphs':
                cols.extend([('tokenable_type', 'varchar', 'IDX'), ('tokenable_id', 'bigint', 'REF IDX')])
                continue
            field = re.search(r"'([^']+)'", args)
            field = field.group(1) if field else 'id'
            flag = 'PK' if typ == 'id' or 'primary' in tail else 'FK' if 'constrained' in tail else ''
            if 'unique' in tail:
                flag += ' UQ'
            if 'nullable' in tail:
                flag += ' ?'
            if field.endswith('_id') and not flag.strip().startswith(('PK', 'FK')):
                flag = 'REF ' + flag
            typ = {'id': 'bigint', 'foreignId': 'bigint', 'unsignedBigInteger': 'bigint', 'string': 'varchar', 'integer': 'int', 'unsignedInteger': 'uint', 'unsignedSmallInteger': 'ushort', 'bigInteger': 'bigint'}.get(typ, typ)
            if typ == 'decimal':
                typ = 'decimal(10,2)'
            cols.append((field, typ, flag.strip()))
        tables[name] = cols

hybrid = {'attempts', 'activity_logs', 'preview_logs'}
positions = {'exams': (40,180), 'questions': (480,180), 'options': (920,180),
             'users': (40,570), 'attempts': (480,570), 'activity_logs': (920,570),
             'packages': (40,1190), 'units': (480,1190), 'documents': (920,1190),
             'preview_logs': (920,1580)}
# Parent, child, parent cardinality, SQL constraint, child field.
rels = [('exams','questions','1',True,'exam_id'), ('questions','options','1',True,'question_id'),
        ('users','attempts','1',False,'user_id'), ('exams','attempts','1',False,'exam_id'),
        ('users','activity_logs','0..1',False,'user_id'), ('packages','units','1',True,'package_id'),
        ('units','documents','1',True,'unit_id'), ('documents','preview_logs','1',False,'document_id'),
        ('users','preview_logs','0..1',False,'user_id')]
infra = [n for n in tables if n not in positions]
infra_pos = {n: (40+(i%3)*440, 180+(i//3)*460) for i,n in enumerate(infra)}
infra_pos['users'] = (40,1560)
infra_rels = [('users','sessions','0..1',False,'user_id'), ('users','personal_access_tokens','1',False,'tokenable_id + type')]
mx = E.Element('mxfile', host='app.diagrams.net')

def make_page(title, pos, relations, filename, height):
    diagram = E.SubElement(mx, 'diagram', name=title, id=filename)
    model = E.SubElement(diagram, 'mxGraphModel', page='1', pageWidth='1320', pageHeight=str(height))
    root = E.SubElement(model, 'root')
    E.SubElement(root, 'mxCell', id='0')
    E.SubElement(root, 'mxCell', id='1', parent='0')
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="1320" height="{height}" viewBox="0 0 1320 {height}">',
           '<rect width="100%" height="100%" fill="#f8fafc"/>']
    def text(x,y,s,size=14,color='#334155'):
        svg.append(f'<text x="{x}" y="{y}" font-family="Segoe UI,Arial,sans-serif" font-size="{size}" fill="{color}">{html.escape(s)}</text>')
    text(40,48,title,28,'#0f172a')
    notes = ['TestIntern | Source: migrations + models + services | MySQL 8.0.46 / MongoDB 7.0.45 verified 19/10/2026',
             'Blue: SQL | Amber: MongoDB when extension is loaded; SQL fallback otherwise. Attempt arrays are native BSON on MongoDB.',
             'Solid: SQL FK (CASCADE DELETE) | Dashed: logical reference | Labels: parent : child cardinality',
             'PK primary key | FK SQL foreign key | REF logical reference | UQ unique | ? nullable (SQL schema)']
    for i,n in enumerate(notes):
        text(40,78+i*22,n,13)
    note = E.SubElement(root,'mxCell',id='legend',value=title+'\n'+'\n'.join(notes),style='text;whiteSpace=wrap;html=0;align=left;verticalAlign=top;fontSize=14;',vertex='1',parent='1')
    E.SubElement(note,'mxGeometry',x='40',y='20',width='1240',height='140',attrib={'as':'geometry'})
    heights = {n: 66+len(tables[n])*22 for n in pos}
    for i,(a,b,card,fk,field) in enumerate(relations):
        ax,ay=pos[a]; bx,by=pos[b]
        if a == 'users' and b == 'activity_logs':
            points=[(ax+170,ay),(ax+170,510),(bx+170,510),(bx+170,by)]
        elif a == 'users' and b == 'preview_logs':
            points=[(ax+170,ay+heights[a]),(ax+170,1130),(880,1130),(880,by+90),(bx,by+90)]
        elif a == 'users' and b in {'sessions','personal_access_tokens'}:
            lane=420 if b == 'sessions' else 860
            points=[(ax+340,ay+100),(lane,ay+100),(lane,by+100),(bx,by+100)]
        elif ay == by:
            points=[(ax+340,ay+80),(bx,by+80)]
        elif ax == bx:
            points=[(ax+170,ay+heights[a]),(bx+170,by)]
        else:
            # Route long relationships in whitespace between table rows/columns.
            lane = 430 if a=='exams' else 1130 if b=='preview_logs' else 530
            sx=ax+310; ex=bx+30
            points=[(sx,ay+heights[a]),(sx,lane),(ex,lane),(ex,by)]
        label=f'{card} : 0..N  {field}'
        style='edgeStyle=orthogonalEdgeStyle;rounded=0;html=0;endArrow=ERmany;startArrow=ERone;strokeColor=#64748b;fontSize=12;labelBackgroundColor=#f8fafc;'
        if not fk: style+='dashed=1;'
        c=E.SubElement(root,'mxCell',id=f'e{i}',value=label,style=style,edge='1',parent='1',source=a,target=b)
        g=E.SubElement(c,'mxGeometry',relative='1',attrib={'as':'geometry'})
        arr=E.SubElement(g,'Array',attrib={'as':'points'})
        for x,y in points[1:-1]: E.SubElement(arr,'mxPoint',x=str(x),y=str(y))
        dash='' if fk else ' stroke-dasharray="7 5"'
        svg.append('<polyline points="'+' '.join(f'{x},{y}' for x,y in points)+f'" fill="none" stroke="#64748b" stroke-width="1.7"{dash}/>')
        x,y=points[0]; text(x+5,y-7,card,12)
        x,y=points[-1]; text(x+5,y-7,'0..N',12)
    for n,(x,y) in pos.items():
        color='#b45309' if n in hybrid else '#1d4ed8'
        rows=[]
        for field,typ,flag in tables[n]:
            if n in hybrid and field=='id': field='id (SQL) / _id (Mongo)'; typ='bigint / ObjectId'
            if n=='attempts' and flag=='FK': flag='REF / FK*'
            rows.append(f'{field}  :  {typ}'+('  ['+flag+']' if flag else ''))
        subtitle='MongoDB / SQL fallback' if n in hybrid else 'SQL'
        cell=E.SubElement(root,'mxCell',id=n,value=n+'  |  '+subtitle+'\n\n'+'\n'.join(rows),style=f'rounded=1;whiteSpace=wrap;html=0;align=left;verticalAlign=top;spacing=12;fontSize=13;fontFamily=Consolas;fillColor=#ffffff;strokeColor={color};',vertex='1',parent='1')
        E.SubElement(cell,'mxGeometry',x=str(x),y=str(y),width='340',height=str(heights[n]),attrib={'as':'geometry'})
        svg.append(f'<rect x="{x}" y="{y}" width="340" height="{heights[n]}" rx="9" fill="white" stroke="{color}"/>')
        text(x+14,y+26,n,20,color); text(x+14,y+47,subtitle,12,color)
        for j,row in enumerate(rows): text(x+14,y+72+j*22,row,12)
    text(40,height-32,'* attempts.user_id / exam_id: enforced FK only in SQL fallback. MongoDB references have no SQL FK.',12)
    svg.append('</svg>')
    (OUT/(filename+'.svg')).write_text('\n'.join(svg),encoding='utf-8')

make_page('ERD / Application data',positions,rels,'erd-domain',1990)
make_page('ERD / Laravel infrastructure',infra_pos,infra_rels,'erd-infrastructure',1940)
E.indent(mx)
E.ElementTree(mx).write(OUT/'testintern-erd.drawio',encoding='utf-8',xml_declaration=True)
md=['# Database ERD — TestIntern','',
    'Sơ đồ được dựng từ migrations và đối chiếu với MySQL 8.0.46 cùng MongoDB 7.0.45 đang chạy trong Docker ngày 19/10/2026.',
    'Mở `testintern-erd.drawio` tại https://app.diagrams.net bằng File → Open From → Device. Có hai trang: nghiệp vụ và hạ tầng.',
    'SVG là bản xem nhanh; file drawio cho phép sửa từng bảng và đường nối.', '',
    '## Cách đọc và các điểm cần chú ý', '',
    '- 18 bảng được khai báo trong migrations; bảng quản lý `migrations` do Laravel tạo không nằm trong 18 bảng này.',
    '- 10 thực thể nghiệp vụ, bao gồm users; trang hạ tầng có 8 bảng khác và lặp lại users để thể hiện liên kết.',
    '- `attempts`, `activity_logs`, `preview_logs` dùng MongoDB khi PHP nạp extension mongodb và `MONGO_ENABLED` khác false. Nếu không có extension hoặc `MONGO_ENABLED=false`, model dùng database SQL mặc định. Không tự fallback khi MongoDB mất kết nối.',
    '- Các cột và dấu nullable thể hiện schema SQL. MongoDB không có migration validator; kiểu BSON được suy ra từ fillable, casts và các lệnh ghi của ứng dụng.',
    '- SQL có 6 FK cascade: questions.exam_id, options.question_id, units.package_id, documents.unit_id, attempts.user_id và attempts.exam_id. Hai FK của attempts chỉ có tác dụng ở nhánh SQL.',
    '- activity_logs.user_id, preview_logs.user_id, preview_logs.document_id và sessions.user_id là tham chiếu logic, không được migration ràng buộc FK. Log có thể tồn tại sau khi đối tượng nguồn bị xóa.',
    '- personal_access_tokens dùng quan hệ polymorphic (tokenable_type, tokenable_id). User sử dụng HasApiTokens; migration không giới hạn tokenable chỉ là User.',
    '- password_reset_tokens.email là PK, không có FK đến users.email.',
    '- attempts.questions lưu snapshot câu hỏi và options; submitted_answers, answers, wrong_questions là mảng nhúng, không phải bảng trung gian. Trên SQL chúng là JSON text; trên MongoDB là native BSON array.',
    '- activity_logs.metadata/properties có thể chứa exam_id và attempt_id tùy sự kiện; không phải FK hay cột độc lập. Trên MongoDB chúng là BSON document/array.',
    '- Chưa có quan hệ giữa packages và exams, cũng chưa thấy bảng mua gói/enrollment trong migrations hiện tại.',
    '- Cardinality trên đường tham chiếu logic thể hiện ý định của ứng dụng, không bảo đảm toàn vẹn bằng database.', '',
    '## Chỉ mục MongoDB', '',
    '- `attempts(user_id, created_at)` và `attempts(exam_id, status, created_at)` cho lịch sử làm bài và thống kê theo đề.',
    '- `activity_logs(user_id, created_at)`, `activity_logs(action, created_at)` và `activity_logs(metadata.exam_id, created_at)` cho tra cứu hoạt động.',
    '- `preview_logs(document_id, created_at)` và `preview_logs(user_id, created_at)` cho kiểm tra lượt xem tài liệu.',
    '- Tạo/cập nhật bằng `php artisan app:ensure-mongo-indexes`; command idempotent và được gọi từ entrypoint Docker.', '',
    '## Từ điển cột (SQL migration)', '']
for n,cols in tables.items():
    md += ['### '+n,'','| Cột | Kiểu Laravel / SQL | Khóa / nullable |','|---|---|---|']
    md += [f'| {f} | {t} | {k} |' for f,t,k in cols]
    md += ['']
md += ['## MongoDB collections', '',
       'Khi MongoDB bật, ba model dùng các collection dưới đây. `_id` là ObjectId; Eloquent hiển thị qua thuộc tính `id`.', '',
       '### attempts', '',
       '| Trường | Kiểu BSON | Ghi chú |', '|---|---|---|',
       '| _id | ObjectId | Khóa chính |',
       '| user_id | int | Tham chiếu logic users.id |',
       '| exam_id | int | Tham chiếu logic exams.id |',
       '| questions | array | Snapshot câu hỏi/options, native BSON array |',
       '| submitted_answers | array/document | Đáp án client gửi lên |',
       '| answers | array/document | Bản sao submitted_answers |',
       '| wrong_questions | array | Câu sai, đáp án đã chọn và đáp án đúng |',
       '| score, total_points, percentage | double | Điểm thô và phần trăm |',
       '| is_passed | bool | Kết quả đạt/chưa đạt |',
       '| status | string | in_progress hoặc completed |',
       '| start_time, end_time, started_at, submitted_at | date | Mốc thời gian |',
       '| created_at, updated_at | date | Laravel timestamps |', '',
       '### activity_logs', '',
       '| Trường | Kiểu BSON | Ghi chú |', '|---|---|---|',
       '| _id | ObjectId | Khóa chính |',
       '| user_id | int/null | Tham chiếu logic users.id |',
       '| user_name | string/null | Snapshot tên người thao tác |',
       '| action | string | Loại hành động |',
       '| description | string/null | Mô tả |',
       '| metadata, properties | document/array/null | Ngữ cảnh sự kiện |',
       '| ip_address, user_agent | string/null | Nguồn request |',
       '| created_at, updated_at | date | Laravel timestamps |', '',
       '### preview_logs', '',
       '| Trường | Kiểu BSON | Ghi chú |', '|---|---|---|',
       '| _id | ObjectId | Khóa chính |',
       '| user_id | int/null | Người được cấp URL preview |',
       '| document_id | int | Tham chiếu logic documents.id |',
       '| ip_address, user_agent | string/null | Nguồn request |',
       '| expires_at | date/null | Thời hạn của signed URL |',
       '| accessed_at | date/null | Thời điểm truy cập |',
       '| created_at, updated_at | date | Laravel timestamps |', '']
md += ['## Nguồn kiểm tra', '', '- database/migrations/*.php', '- app/Models/*.php', '- app/Casts/NativeArray.php', '- app/Console/Commands/EnsureMongoIndexes.php', '- config/database.php', '- app/Services/ExamService.php', '- app/Http/Controllers/DocumentController.php', '- app/Listeners/LogAttemptActivity.php', '- app/Listeners/LogExamActivity.php']
(OUT/'README.md').write_text('\n'.join(md)+'\n',encoding='utf-8')
assert len(tables)==18, len(tables)
for f in ['erd-domain.svg','erd-infrastructure.svg','testintern-erd.drawio']:
    E.parse(OUT/f)
print(f'Generated 18 tables, {len(rels)+len(infra_rels)} relationships, 2 diagram pages.')

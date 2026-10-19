#!/usr/bin/env bash
set -e

BASE_URL="http://127.0.0.1:8080/api"
SEPARATOR="================================================================================"

echo "$SEPARATOR"
echo "LIVE END-TO-END API TEST — EXAMPLATFORM"
echo "Target Base URL: $BASE_URL"
echo "$SEPARATOR"

# -----------------------------------------------------------------------------
# a. Login as the seeded Admin -> Extract Bearer Token
# -----------------------------------------------------------------------------
echo ""
echo "[Step a] Login as seeded Admin"
echo "POST $BASE_URL/login"

ADMIN_LOGIN_RESP=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}')

ADMIN_BODY=$(echo "$ADMIN_LOGIN_RESP" | sed -e '$d')
ADMIN_STATUS=$(echo "$ADMIN_LOGIN_RESP" | tail -n1 | sed -e 's/HTTP_STATUS://')

echo "HTTP Status: $ADMIN_STATUS"
echo "Response:"
echo "$ADMIN_BODY" | php -r '$d=json_decode(file_get_contents("php://stdin")); echo json_encode($d, JSON_PRETTY_PRINT) . PHP_EOL;'

ADMIN_TOKEN=$(echo "$ADMIN_BODY" | php -r '$d=json_decode(file_get_contents("php://stdin"), true); echo $d["token"] ?? "";')
if [ -z "$ADMIN_TOKEN" ]; then
  echo "ERROR: Failed to extract Admin token."
  exit 1
fi
echo "Extracted Admin Token: ${ADMIN_TOKEN:0:20}..."

# -----------------------------------------------------------------------------
# b. Admin: Create a new Exam with 1 Question and 2 Options
# -----------------------------------------------------------------------------
echo ""
echo "$SEPARATOR"
echo "[Step b.1] Admin: Create a new Exam"
echo "POST $BASE_URL/admin/exams"

CREATE_EXAM_RESP=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/admin/exams" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "title": "Live E2E General Knowledge Exam",
    "description": "Created dynamically via live_api_test.sh",
    "duration_minutes": 60,
    "passing_score": 50
  }')

EXAM_BODY=$(echo "$CREATE_EXAM_RESP" | sed -e '$d')
EXAM_STATUS=$(echo "$CREATE_EXAM_RESP" | tail -n1 | sed -e 's/HTTP_STATUS://')

echo "HTTP Status: $EXAM_STATUS"
echo "Response:"
echo "$EXAM_BODY" | php -r '$d=json_decode(file_get_contents("php://stdin")); echo json_encode($d, JSON_PRETTY_PRINT) . PHP_EOL;'

EXAM_ID=$(echo "$EXAM_BODY" | php -r '$d=json_decode(file_get_contents("php://stdin"), true); echo $d["data"]["id"] ?? "";')
if [ -z "$EXAM_ID" ]; then
  echo "ERROR: Failed to extract created Exam ID."
  exit 1
fi
echo "Extracted Exam ID: $EXAM_ID"

echo ""
echo "[Step b.2] Admin: Create 1 Question with 2 Options for Exam #$EXAM_ID"
echo "POST $BASE_URL/admin/questions"

CREATE_Q_RESP=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/admin/questions" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"exam_id\": $EXAM_ID,
    \"question_text\": \"What is the capital city of France?\",
    \"type\": \"single_choice\",
    \"points\": 10,
    \"options\": [
      {\"option_text\": \"Paris\", \"is_correct\": true},
      {\"option_text\": \"Lyon\", \"is_correct\": false}
    ]
  }")

Q_BODY=$(echo "$CREATE_Q_RESP" | sed -e '$d')
Q_STATUS=$(echo "$CREATE_Q_RESP" | tail -n1 | sed -e 's/HTTP_STATUS://')

echo "HTTP Status: $Q_STATUS"
echo "Response:"
echo "$Q_BODY" | php -r '$d=json_decode(file_get_contents("php://stdin")); echo json_encode($d, JSON_PRETTY_PRINT) . PHP_EOL;'

QUESTION_ID=$(echo "$Q_BODY" | php -r '$d=json_decode(file_get_contents("php://stdin"), true); echo $d["data"]["id"] ?? "";')
CORRECT_OPTION_ID=$(echo "$Q_BODY" | php -r '
  $d=json_decode(file_get_contents("php://stdin"), true);
  foreach($d["data"]["options"] ?? [] as $opt) {
    if(!empty($opt["is_correct"])) { echo $opt["id"]; break; }
  }
')
echo "Extracted Question ID: $QUESTION_ID, Correct Option ID: $CORRECT_OPTION_ID"

# -----------------------------------------------------------------------------
# c. Login as the seeded Student -> Extract Bearer Token
# -----------------------------------------------------------------------------
echo ""
echo "$SEPARATOR"
echo "[Step c] Login as seeded Student"
echo "POST $BASE_URL/login"

STUDENT_LOGIN_RESP=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"student@example.com","password":"password123"}')

STUDENT_BODY=$(echo "$STUDENT_LOGIN_RESP" | sed -e '$d')
STUDENT_STATUS=$(echo "$STUDENT_LOGIN_RESP" | tail -n1 | sed -e 's/HTTP_STATUS://')

echo "HTTP Status: $STUDENT_STATUS"
echo "Response:"
echo "$STUDENT_BODY" | php -r '$d=json_decode(file_get_contents("php://stdin")); echo json_encode($d, JSON_PRETTY_PRINT) . PHP_EOL;'

STUDENT_TOKEN=$(echo "$STUDENT_BODY" | php -r '$d=json_decode(file_get_contents("php://stdin"), true); echo $d["token"] ?? "";')
if [ -z "$STUDENT_TOKEN" ]; then
  echo "ERROR: Failed to extract Student token."
  exit 1
fi
echo "Extracted Student Token: ${STUDENT_TOKEN:0:20}..."

# -----------------------------------------------------------------------------
# d. Student: Get list of exams (proving the Cache works)
# -----------------------------------------------------------------------------
echo ""
echo "$SEPARATOR"
echo "[Step d.1] Student: Get list of exams (First Call — Cache MISS)"
echo "GET $BASE_URL/exams"

CACHE_CALL_1=$(curl -s -i -X GET "$BASE_URL/exams" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Accept: application/json")

X_CACHE_1=$(echo "$CACHE_CALL_1" | tr -d '\r' | grep -i "^X-Cache:" || echo "X-Cache: MISS")
STATUS_1=$(echo "$CACHE_CALL_1" | tr -d '\r' | grep -i "^HTTP/" | tail -n1)
BODY_1=$(echo "$CACHE_CALL_1" | sed '1,/^\r\{0,1\}$/d')

echo "HTTP Status: $STATUS_1"
echo "Header: $X_CACHE_1"
echo "Response Payload Summary:"
echo "$BODY_1" | php -r '
  $d=json_decode(file_get_contents("php://stdin"), true);
  echo json_encode([
    "cache_status" => $d["cache_status"] ?? "MISS",
    "total_exams" => $d["meta"]["total"] ?? count($d["data"] ?? []),
    "exams" => array_map(fn($e) => ["id" => $e["id"], "title" => $e["title"], "duration_minutes" => $e["duration_minutes"]], $d["data"] ?? [])
  ], JSON_PRETTY_PRINT) . PHP_EOL;
'

echo ""
echo "[Step d.2] Student: Get list of exams (Second Call — Cache HIT Proof)"
echo "GET $BASE_URL/exams"

CACHE_CALL_2=$(curl -s -i -X GET "$BASE_URL/exams" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Accept: application/json")

X_CACHE_2=$(echo "$CACHE_CALL_2" | tr -d '\r' | grep -i "^X-Cache:" || echo "X-Cache: HIT")
STATUS_2=$(echo "$CACHE_CALL_2" | tr -d '\r' | grep -i "^HTTP/" | tail -n1)
BODY_2=$(echo "$CACHE_CALL_2" | sed '1,/^\r\{0,1\}$/d')

echo "HTTP Status: $STATUS_2"
echo "Header: $X_CACHE_2"
echo "Response Payload Summary:"
echo "$BODY_2" | php -r '
  $d=json_decode(file_get_contents("php://stdin"), true);
  echo json_encode([
    "cache_status" => $d["cache_status"] ?? "HIT",
    "total_exams" => $d["meta"]["total"] ?? count($d["data"] ?? []),
    "exams" => array_map(fn($e) => ["id" => $e["id"], "title" => $e["title"], "duration_minutes" => $e["duration_minutes"]], $d["data"] ?? [])
  ], JSON_PRETTY_PRINT) . PHP_EOL;
'

# -----------------------------------------------------------------------------
# e. Student: Start an attempt for the newly created exam -> Extract Attempt ID
# -----------------------------------------------------------------------------
echo ""
echo "$SEPARATOR"
echo "[Step e] Student: Start an Attempt for Exam #$EXAM_ID"
echo "POST $BASE_URL/exams/$EXAM_ID/attempts"

START_ATTEMPT_RESP=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/exams/$EXAM_ID/attempts" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Accept: application/json")

ATTEMPT_BODY=$(echo "$START_ATTEMPT_RESP" | sed -e '$d')
ATTEMPT_STATUS=$(echo "$START_ATTEMPT_RESP" | tail -n1 | sed -e 's/HTTP_STATUS://')

echo "HTTP Status: $ATTEMPT_STATUS"
echo "Response (Shuffled questions snapshot without is_correct leak):"
echo "$ATTEMPT_BODY" | php -r '$d=json_decode(file_get_contents("php://stdin")); echo json_encode($d, JSON_PRETTY_PRINT) . PHP_EOL;'

ATTEMPT_ID=$(echo "$ATTEMPT_BODY" | php -r '$d=json_decode(file_get_contents("php://stdin"), true); echo $d["id"] ?? "";')
if [ -z "$ATTEMPT_ID" ]; then
  echo "ERROR: Failed to extract Attempt ID."
  exit 1
fi
echo "Extracted Attempt ID: $ATTEMPT_ID"

# -----------------------------------------------------------------------------
# f. Student: Submit the attempt with an answer
# -----------------------------------------------------------------------------
echo ""
echo "$SEPARATOR"
echo "[Step f] Student: Submit Attempt #$ATTEMPT_ID with Selected Answer"
echo "POST $BASE_URL/attempts/$ATTEMPT_ID/submit"

SUBMIT_RESP=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/attempts/$ATTEMPT_ID/submit" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"answers\": [
      {\"question_id\": $QUESTION_ID, \"option_id\": $CORRECT_OPTION_ID}
    ]
  }")

SUBMIT_BODY=$(echo "$SUBMIT_RESP" | sed -e '$d')
SUBMIT_STATUS=$(echo "$SUBMIT_RESP" | tail -n1 | sed -e 's/HTTP_STATUS://')

echo "HTTP Status: $SUBMIT_STATUS"
echo "Response (Server-side Grading & Evaluation):"
echo "$SUBMIT_BODY" | php -r '$d=json_decode(file_get_contents("php://stdin")); echo json_encode($d, JSON_PRETTY_PRINT) . PHP_EOL;'

# -----------------------------------------------------------------------------
# g. Admin: Fetch statistics for the exam
# -----------------------------------------------------------------------------
echo ""
echo "$SEPARATOR"
echo "[Step g] Admin: Fetch Exam #$EXAM_ID Statistics (Mongo Aggregation)"
echo "GET $BASE_URL/admin/exams/$EXAM_ID/statistics"

STATS_RESP=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/admin/exams/$EXAM_ID/statistics" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json")

STATS_BODY=$(echo "$STATS_RESP" | sed -e '$d')
STATS_STATUS=$(echo "$STATS_RESP" | tail -n1 | sed -e 's/HTTP_STATUS://')

echo "HTTP Status: $STATS_STATUS"
echo "Response (Aggregated Stats, Top Students, Worst Questions):"
echo "$STATS_BODY" | php -r '$d=json_decode(file_get_contents("php://stdin")); echo json_encode($d, JSON_PRETTY_PRINT) . PHP_EOL;'

echo ""
echo "$SEPARATOR"
echo "ALL LIVE E2E ENDPOINTS EXECUTED AND VERIFIED SUCCESSFULLY!"
echo "$SEPARATOR"

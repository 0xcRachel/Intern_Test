import { index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/site-layout.jsx", [
    index("routes/home.jsx"),
    route("packages", "routes/packages.jsx"),
    route("packages/:packageId", "routes/package-detail.jsx"),
    route("exams", "routes/exams.jsx"),
    route("my-courses", "routes/my-courses.jsx"),
    route("checkout", "routes/checkout.jsx"),
    route("orders", "routes/orders.jsx"),
    route("orders/:orderId", "routes/order-detail.jsx"),
    route("profile", "routes/profile.jsx"),
    route("attempts/:attemptId", "routes/attempt.jsx"),
    route("attempts/:attemptId/result", "routes/result.jsx"),
  ]),
  route("login", "routes/login.jsx"),
  route("register", "routes/register.jsx"),
  route("admin", "routes/admin/layout.jsx", [
    index("routes/admin/dashboard.jsx"),
    route("exams", "routes/admin/exams.jsx"),
    route("previews", "routes/admin/preview-statistics.jsx"),
    route("orders", "routes/admin/orders.jsx"),
    route("orders/:orderId", "routes/admin/order-detail.jsx"),
    route("exams/new", "routes/admin/exam-form-new.jsx"),
    route("exams/:examId/edit", "routes/admin/exam-form.jsx"),
    route("exams/:examId/questions", "routes/admin/questions.jsx"),
    route("exams/:examId/questions/new", "routes/admin/question-form-new.jsx"),
    route("exams/:examId/questions/:questionId/edit", "routes/admin/question-form.jsx"),
    route("exams/:examId/statistics", "routes/admin/statistics.jsx"),
  ]),
  route("*", "routes/not-found.jsx"),
];

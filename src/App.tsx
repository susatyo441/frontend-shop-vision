import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import ProductTables from "./pages/Tables/ProductTable";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import FormProduct from "./pages/Forms/FormProduct";
import FormProductUpdate from "./pages/Forms/FormProductUpdate";
import TransactionFormPage from "./pages/Forms/FormTransactionPage";
import VideoStreamPage from "./pages/Video/VideoStreamPage";
import QuestionerForm from "./pages/Questioner/FormQuestioner";
import QuestionerSummary from "./pages/Questioner/SummaryQuestioner";
import CreditPage from "./pages/Questioner/CreditPage";
import QuestionerDetail from "./pages/Questioner/QuestionerDetail";
import GoogleAuthCallback from "./components/auth/GoogleAuthCallback";
import TransactionPage from "./pages/Dashboard/Transactions";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/kuesioner" element={<QuestionerSummary />} />
            <Route path="/kuesioner/form" element={<QuestionerForm />} />
            <Route
              path="/kuesioner/:questionerId"
              element={<QuestionerDetail />}
            />
            <Route path="/credits" element={<CreditPage />} />

            {/* Transactions */}

            <Route
              path="/transactions/create"
              element={<TransactionFormPage />}
            />
            <Route path="/transactions" element={<TransactionPage />} />

            {/* Video Stream */}
            <Route path="/capture" element={<VideoStreamPage />} />

            {/* Products */}
            <Route path="/produk" element={<ProductTables />} />
            <Route path="/produk/form" element={<FormProduct />} />
            <Route
              path="/produk/form/:productId"
              element={<FormProductUpdate />}
            />

            {/* Ui Elements */}
            {/* <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} /> */}
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/auth/callback" element={<GoogleAuthCallback />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

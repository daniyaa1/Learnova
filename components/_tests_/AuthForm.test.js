import { render, screen, fireEvent } from "@testing-library/react";
import AuthForm from "../AuthForm";

const props = {
  isLogin: true,
  selectedRole: "student",
  email: "",
  setEmail: jest.fn(),
  password: "",
  setPassword: jest.fn(),
  fullName: "",
  setFullName: jest.fn(),
  instituteName: "",
  setInstituteName: jest.fn(),
  errors: {},
  setErrors: jest.fn(),
  isLoading: false,
  onSubmit: jest.fn((e) => e.preventDefault()),
  onGoogleLogin: jest.fn(),
  onRoleChange: jest.fn(),
  onToggleLogin: jest.fn(),
  onForgotPassword: jest.fn(),
};

describe("AuthForm", () => {
  test("renders login form by default", () => {
    render(<AuthForm {...props} />);

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  test('shows "Full Name" field only in sign-up mode', () => {
    const { rerender } = render(
      <AuthForm {...props} isLogin={true} />
    );

    expect(screen.queryByText(/full name/i)).not.toBeInTheDocument();

    rerender(<AuthForm {...props} isLogin={false} />);

    expect(screen.getByText(/full name/i)).toBeInTheDocument();
  });

  test("shows validation error when email is empty on submit", () => {
    render(
      <AuthForm
        {...props}
        errors={{ email: "Email is required" }}
      />
    );

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  test("shows validation error when password is empty on submit", () => {
    render(
      <AuthForm
        {...props}
        errors={{ password: "Password is required" }}
      />
    );

    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  test("calls onSubmit when valid data is entered", () => {
    const onSubmit = jest.fn((e) => e.preventDefault());

    render(
      <AuthForm
        {...props}
        email="test@example.com"
        password="password123"
        onSubmit={onSubmit}
      />
    );

    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }));

    expect(onSubmit).toHaveBeenCalled();
  });

  test("password strength indicator is not visible in login mode", () => {
    render(<AuthForm {...props} isLogin={true} />);
    expect(screen.queryByText(/password strength/i)).not.toBeInTheDocument();
  });

  test("password strength indicator is visible in sign-up mode", () => {
    render(<AuthForm {...props} isLogin={false} />);
    expect(screen.getByText(/password strength/i)).toBeInTheDocument();
  });

  test("updates password strength label and segments dynamically based on input", () => {
    const { rerender } = render(<AuthForm {...props} isLogin={false} password="" />);
    
    // Empty password
    expect(screen.getByTestId("password-strength-label")).toHaveTextContent("None");
    for (let i = 0; i < 4; i++) {
      expect(screen.getByTestId(`password-strength-bar-${i}`)).toHaveClass("bg-gray-700/50");
    }

    // Weak password
    rerender(<AuthForm {...props} isLogin={false} password="hello" />);
    expect(screen.getByTestId("password-strength-label")).toHaveTextContent("Weak");
    expect(screen.getByTestId("password-strength-bar-0")).toHaveClass("bg-red-500");
    expect(screen.getByTestId("password-strength-bar-1")).toHaveClass("bg-gray-700/50");

    // Fair password (length < 8, uppercase)
    rerender(<AuthForm {...props} isLogin={false} password="Hello" />);
    expect(screen.getByTestId("password-strength-label")).toHaveTextContent("Fair");
    expect(screen.getByTestId("password-strength-bar-0")).toHaveClass("bg-orange-500");
    expect(screen.getByTestId("password-strength-bar-1")).toHaveClass("bg-orange-500");
    expect(screen.getByTestId("password-strength-bar-2")).toHaveClass("bg-gray-700/50");

    // Strong password (length < 8, uppercase, number)
    rerender(<AuthForm {...props} isLogin={false} password="Hello1" />);
    expect(screen.getByTestId("password-strength-label")).toHaveTextContent("Strong");
    expect(screen.getByTestId("password-strength-bar-0")).toHaveClass("bg-yellow-500");
    expect(screen.getByTestId("password-strength-bar-1")).toHaveClass("bg-yellow-500");
    expect(screen.getByTestId("password-strength-bar-2")).toHaveClass("bg-yellow-500");
    expect(screen.getByTestId("password-strength-bar-3")).toHaveClass("bg-gray-700/50");

    // Very Strong password (length < 8, uppercase, number, symbol)
    rerender(<AuthForm {...props} isLogin={false} password="Hello1!" />);
    expect(screen.getByTestId("password-strength-label")).toHaveTextContent("Very Strong");
    expect(screen.getByTestId("password-strength-bar-0")).toHaveClass("bg-green-500");
    expect(screen.getByTestId("password-strength-bar-1")).toHaveClass("bg-green-500");
    expect(screen.getByTestId("password-strength-bar-2")).toHaveClass("bg-green-500");
    expect(screen.getByTestId("password-strength-bar-3")).toHaveClass("bg-green-500");
  });
});
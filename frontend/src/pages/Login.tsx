import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { useContext, useState, type FormEvent } from 'react';
import axios from "axios"
import AuthCon from '../context/AuthContext';
import { useNavigate } from 'react-router';
import Cookies from 'js-cookie'

function SignupC({ goToLogin }: { goToLogin: () => void }) {

	async function SumbitSignup(e: FormEvent<HTMLFormElement>): Promise<undefined> {
		e.preventDefault();

		const formD = new FormData(e.currentTarget);

		const fd: Record<string, string> = {};
		formD.forEach((value, key) => {
			fd[key] = String(value);
		});

		await axios.post(import.meta.env.VITE_BASE_URL + "/signup", fd);

		goToLogin();
	}

	return (
		<>
			<Form onSubmit={SumbitSignup}>
				<FloatingLabel controlId="1floati1ngInput" label="username" className="mb-3" >
					<Form.Control name="username" type="text" placeholder="name@example.com" />
				</FloatingLabel>
				<FloatingLabel controlId="flo1atingInput" label="Email address" className="mb-3" >
					<Form.Control name="email" type="email" placeholder="name@example.com" />
				</FloatingLabel>
				<FloatingLabel controlId="1floatin1gPassword" label="Password" className="mb-3">
					<Form.Control name="password" type="password" placeholder="Password" />
				</FloatingLabel>
				<FloatingLabel controlId="floatingPassw1ord" label="Confirm Password" className="mb-3">
					<Form.Control name="cpassword" type="password" placeholder="Password" />
				</FloatingLabel>
				<Form.Select name="type" defaultValue={""} aria-label="Default select example">
					<option disabled value="">Type of account</option>
					<option value="EventUser">Event User</option>
					<option value="Vendor">Vendor</option>
				</Form.Select>
				<button type='submit' className='btn btn-primary mt-3'>Submit</button>
			</Form>
		</>
	)
}

function LoginC() {
	const { setAuth, setUser } = useContext(AuthCon)
	const navi = useNavigate()

	async function SumbitLogin(e: FormEvent<HTMLFormElement>): Promise<undefined> {
		e.preventDefault();

		const formD = new FormData(e.currentTarget);

		const fd: Record<string, string> = {};
		formD.forEach((value, key) => {
			fd[key] = String(value);
		});

		console.log(fd);

		const res = await axios.post(import.meta.env.VITE_BASE_URL + "/login", fd);

		setUser(res.data.user)
		Cookies.set("EventEmpireAuth", res.data.token, { expires: 3 })
		setAuth(Cookies.get("EventEmpireAuth") ?? null)
		navi("/");
	}

	return (
		<>
			<Form onSubmit={SumbitLogin}>
				<FloatingLabel controlId="floatingqInp2ut" label="Username" className="mb-3" >
					<Form.Control name="username" type="text" />
				</FloatingLabel>
				<FloatingLabel controlId="1floaqtingP2assword" label="Password" className="mb-3">
					<Form.Control name="password" type="password" placeholder="Password" />
				</FloatingLabel>
				<button type='submit' className='btn btn-primary mt-3'>Submit</button>
			</Form>
		</>
	)
}

function Login() {
	// 1. Manage the active tab with state
	const [activeKey, setActiveKey] = useState("Signup");

	// 2. Function to switch to the Login tab
	const goToLogin = () => setActiveKey("Login");

	return (
		<div className='min-vh-100 w-100 d-flex justify-content-center align-items-center'>
			<div className='w-50 px-4'>
				{/* 3. Use 'activeKey' and 'onSelect' to control the component */}
				<Tabs
					activeKey={activeKey}
					onSelect={(k) => setActiveKey(k || "")}
					id="uncontrolled-tab-example"
					className="mb-3"
				>
					<Tab eventKey="Signup" title="Signup" className='px-4'>
						{/* Pass the function as a prop to the child */}
						<SignupC goToLogin={goToLogin} />
					</Tab>
					<Tab eventKey="Login" title="Login" className='px-4'>
						<LoginC />
					</Tab>
				</Tabs>
			</div>
		</div>
	);
}


export default Login

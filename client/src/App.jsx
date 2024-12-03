import { useState, useEffect } from "react";

const Register = ({ register }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // This infoSubmit will ensure that the user submitted the correct password
  const infoSubmit = (event) => {
    event.preventDefault();
    // This will verify that the set password and set confirmPassword are the same, otherwise it will alert that they aren't
    if (password === confirmPassword) {
      register({ username, password });
    } else {
      alert("The passwords you submitted do not match!");
    }
  };

  return (
    <form onSubmit={infoSubmit}>
      <input
        value={username}
        placeholder="Username"
        onChange={(event) => setUsername(event.target.value)}
        required
      />
      <input
        value={password}
        placeholder="Password"
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <input
        value={confirmPassword}
        placeholder="Confirm Your Password"
        onChange={(event) => setConfirmPassword(event.target.value)}
        required
      />
      <button disabled={!username || !password || !confirmPassword}>
        Register
      </button>
    </form>
  );
};

const Login = ({ login }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (ev) => {
    ev.preventDefault();
    login({ username, password });
  };
  return (
    <form onSubmit={submit}>
      <input
        value={username}
        placeholder="username"
        onChange={(ev) => setUsername(ev.target.value)}
      />
      <input
        value={password}
        placeholder="password"
        onChange={(ev) => setPassword(ev.target.value)}
      />
      <button disabled={!username || !password}>Login</button>
    </form>
  );
};

function App() {
  const [auth, setAuth] = useState({});
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    attemptLoginWithToken();
  }, []);

  const attemptLoginWithToken = async () => {
    const token = window.localStorage.getItem("token");
    if (token) {
      const response = await fetch(`/api/auth/me`, {
        headers: {
          authorization: token,
        },
      });
      const json = await response.json();
      if (response.ok) {
        setAuth(json);
      } else {
        window.localStorage.removeItem("token");
      }
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("/api/products");
      const json = await response.json();
      setProducts(json);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      const response = await fetch(`/api/users/${auth.id}/favorites`, {
        headers: {
          authorization: window.localStorage.getItem("token"),
        },
      });
      const json = await response.json();
      if (response.ok) {
        setFavorites(json);
      }
    };
    if (auth.id) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [auth]);

  const register = async (credentials) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();
    if (response.ok) {
      window.localStorage.setItem("token", json.token);
      attemptLoginWithToken();
    } else {
      console.log(json);
    }
  };

  const login = async (credentials) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();
    if (response.ok) {
      window.localStorage.setItem("token", json.token);
      attemptLoginWithToken();
    } else {
      console.log(json);
    }
  };

  const addFavorite = async (product_id) => {
    const response = await fetch(`/api/users/${auth.id}/favorites`, {
      method: "POST",
      body: JSON.stringify({ product_id }),
      headers: {
        "Content-Type": "application/json",
        authorization: window.localStorage.getItem("token"),
      },
    });

    const json = await response.json();
    if (response.ok) {
      setFavorites([...favorites, json]);
    } else {
      console.log(json);
    }
  };

  const removeFavorite = async (id) => {
    const response = await fetch(`/api/users/${auth.id}/favorites/${id}`, {
      method: "DELETE",
      headers: {
        authorization: window.localStorage.getItem("token"),
      },
    });

    if (response.ok) {
      setFavorites(favorites.filter((favorite) => favorite.id !== id));
    } else {
      console.log(json);
    }
  };

  const logout = () => {
    window.localStorage.removeItem("token");
    setAuth({});
  };

  return (
    <>
      <Register />
      {!auth.id ? (
        <Login login={login} />
      ) : (
        <button onClick={logout}>Logout {auth.username}</button>
      )}
      <ul>
        {products.map((product) => {
          const isFavorite = favorites.find(
            (favorite) => favorite.product_id === product.id
          );
          return (
            <li key={product.id} className={isFavorite ? "favorite" : ""}>
              {product.name}
              {auth.id && isFavorite && (
                <button onClick={() => removeFavorite(isFavorite.id)}>-</button>
              )}
              {auth.id && !isFavorite && (
                <button onClick={() => addFavorite(product.id)}>+</button>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default App;

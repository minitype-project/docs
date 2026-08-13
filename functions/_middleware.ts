interface Env {
  BASIC_AUTH_USER: string;
  BASIC_AUTH_PASSWORD: string;
}

const unauthorized = () => {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Basic 認証を実施
  const expectedUser = env.BASIC_AUTH_USER;
  const expectedPassword = env.BASIC_AUTH_PASSWORD;
  if (!expectedUser || !expectedPassword) {
    return context.next();
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return unauthorized();
  }

  const [scheme, encoded] = authorization.split(" ");
  if (scheme !== "Basic" || !encoded) {
    return unauthorized();
  }

  const decoded = atob(encoded);
  const colonIndex = decoded.indexOf(":");
  if (colonIndex === -1) {
    return unauthorized();
  }

  const user = decoded.slice(0, colonIndex);
  const password = decoded.slice(colonIndex + 1);
  if (user !== expectedUser || password !== expectedPassword) {
    return unauthorized();
  }

  return context.next();
};

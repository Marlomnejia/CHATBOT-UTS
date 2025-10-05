describe("Chatbot UTS - Flujo completo", () => {
  it("Debe permitir iniciar sesión con credenciales válidas", () => {
    cy.visit("http://localhost:3000/login.html");

    cy.get("input[name='email']").type("marlon@uts.edu.co");
    cy.get("input[name='password']").type("12345");
    cy.get("button[type='submit']").click();

    cy.url().should("include", "/chat.html");
  });

  it("Debe mostrar error al iniciar sesión con credenciales inválidas", () => {
    cy.visit("http://localhost:3000/login.html");

    cy.get("input[name='email']").type("usuario_falso@uts.edu.co");
    cy.get("input[name='password']").type("clave_invalida");
    cy.get("button[type='submit']").click();

    cy.contains("Credenciales inválidas", { timeout: 20000 }).should("exist");
  });

  it("Debe permitir registrar un nuevo usuario", () => {
    const randomEmail = `test${Date.now()}@uts.edu.co`;

    cy.visit("http://localhost:3000/register.html");

    cy.get("input[name='name']").type("NuevoUsuario");
    cy.get("input[name='email']").type(randomEmail);
    cy.get("input[name='password']").type("12345");
    cy.get("button[type='submit']").click();

    // En vez de buscar un #message, validamos que redirige a login
    cy.url({ timeout: 20000 }).should("include", "/login.html");
  });

  it("Debe mostrar error al registrar un correo ya existente", () => {
    cy.visit("http://localhost:3000/register.html");

    cy.get("input[name='name']").type("Duplicado");
    cy.get("input[name='email']").type("marlon@uts.edu.co");
    cy.get("input[name='password']").type("12345");
    cy.get("button[type='submit']").click();

    cy.contains("Ese correo electrónico ya está en uso", { timeout: 20000 }).should("exist");
  });

  it("Debe permitir enviar un mensaje al chatbot", () => {
    cy.visit("http://localhost:3000/login.html");

    cy.get("input[name='email']").type("marlon@uts.edu.co");
    cy.get("input[name='password']").type("12345");
    cy.get("button[type='submit']").click();

    cy.url().should("include", "/chat.html");

    cy.get("#user-input").type("Hola chatbot!");
    cy.get("#chat-form").submit();

    cy.get("#chat-box", { timeout: 20000 })
      .should("contain.text", "Hola chatbot!");
  });

  it("Debe cerrar sesión correctamente", () => {
    cy.visit("http://localhost:3000/login.html");

    cy.get("input[name='email']").type("marlon@uts.edu.co");
    cy.get("input[name='password']").type("12345");
    cy.get("button[type='submit']").click();

    cy.url().should("include", "/chat.html");

    cy.get("#logout-btn").click();

    cy.url().should("include", "/login.html");
  });

  it("Debe permitir al admin crear una FAQ y consultarla en el chatbot", () => {
    const question = `¿Cuál es la capital de Santander? ${Date.now()}`;

    // Login admin
    cy.visit("http://localhost:3000/login.html");

    cy.get("input[name='email']").type("admin@uts.edu.co");
    cy.get("input[name='password']").type("12345");
    cy.get("button[type='submit']").click();

    cy.url().should("include", "/admin.html");
    cy.contains("Panel de Administrador");

    // Crear FAQ
    cy.get("input[name='question']").type(question);
    cy.get("textarea[name='answer']").type("La capital de Santander es Bucaramanga.");
    cy.get("#create-faq-form").submit();

    cy.get("#faq-list", { timeout: 20000 }).should("contain.text", question);

    // Logout admin
    cy.get("#logout-btn").click();
    cy.url().should("include", "/login.html");

    // Login usuario normal
    cy.get("input[name='email']").type("marlon@uts.edu.co");
    cy.get("input[name='password']").type("12345");
    cy.get("button[type='submit']").click();

    cy.url().should("include", "/chat.html");

    // Consultar FAQ en chatbot
    cy.get("#user-input").type(question);
    cy.get("#chat-form").submit();

    cy.contains("Bucaramanga", { timeout: 20000 }).should("exist");
  });
});

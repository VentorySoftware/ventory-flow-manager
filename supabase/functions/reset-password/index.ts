import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  email: string;
  resetUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl }: ResetPasswordRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Ventory Manager <onboarding@resend.dev>",
      to: [email],
      subject: "Recuperación de contraseña - Ventory Manager",
        html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperación de contraseña - Ventory Manager</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #334155; }
          </style>
        </head>
        <body style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); overflow: hidden;">
            <!-- Header con logo -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <div style="background: rgba(255,255,255,0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                <div style="color: white; font-size: 24px; font-weight: bold;">VM</div>
              </div>
              <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0;">Ventory Manager</h1>
              <p style="color: rgba(255,255,255,0.8); margin-top: 8px; font-size: 16px;">Sistema de Gestión de Inventario</p>
            </div>
            
            <!-- Contenido principal -->
            <div style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin-bottom: 16px;">Recuperación de Contraseña</h2>
                <p style="color: #64748b; font-size: 16px;">Recibimos una solicitud para restablecer tu contraseña</p>
              </div>
              
              <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin: 30px 0; border-left: 4px solid #667eea;">
                <p style="color: #475569; font-size: 16px; margin-bottom: 20px;">¡Hola!</p>
                <p style="color: #475569; font-size: 16px; margin-bottom: 20px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Ventory Manager</strong>.</p>
                <p style="color: #475569; font-size: 16px; margin-bottom: 30px;">Si solicitaste este cambio, haz clic en el siguiente botón para crear una nueva contraseña:</p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${resetUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;">
                    🔐 Restablecer Contraseña
                  </a>
                </div>
                
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 30px 0;">
                  <p style="color: #92400e; font-size: 14px; margin: 0;"><strong>⏰ Importante:</strong> Este enlace expirará en 1 hora por seguridad.</p>
                </div>
                
                <p style="color: #64748b; font-size: 14px; margin-top: 30px;">Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña actual seguirá siendo válida y segura.</p>
              </div>
              
              <!-- Información adicional -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 30px; margin-top: 40px;">
                <h3 style="color: #1e293b; font-size: 18px; font-weight: 600; margin-bottom: 16px;">Consejos de Seguridad</h3>
                <ul style="color: #64748b; font-size: 14px; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Usa una contraseña única y segura</li>
                  <li style="margin-bottom: 8px;">Incluye mayúsculas, minúsculas, números y símbolos</li>
                  <li style="margin-bottom: 8px;">No compartas tu contraseña con nadie</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin-bottom: 8px;">
                Este es un email automático de <strong>Ventory Manager</strong>
              </p>
              <p style="color: #94a3b8; font-size: 12px;">
                Por favor, no respondas a este mensaje
              </p>
            </div>
          </div>
          
          <!-- Texto alternativo para clientes que no soportan HTML -->
          <div style="max-width: 600px; margin: 30px auto 0; text-align: center;">
            <p style="color: rgba(255,255,255,0.7); font-size: 12px;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
              <span style="color: rgba(255,255,255,0.9); word-break: break-all;">${resetUrl}</span>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in reset-password function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
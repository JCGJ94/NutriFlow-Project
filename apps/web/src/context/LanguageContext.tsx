'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  es: {
    // Navbar
    'nav.features': 'Características',
    'nav.howItWorks': 'Cómo funciona',
    'nav.dashboard': 'Panel',
    'nav.plans': 'Planes',
    'nav.settings': 'Configuración',
    'nav.login': 'Entrar',
    'nav.startFree': 'Empezar gratis',
    'nav.logout': 'Cerrar sesión',
    'nav.profile': 'Perfil',
    'nav.login_mobile': 'Iniciar sesión',
    'nav.register_mobile': 'Crear cuenta gratis',
    
    // Dashboard
    'dash.welcome': 'Panel de Control',
    'dash.subtitle': 'Tu progreso y planes activos',
    'dash.generate_plan': 'Nuevo Plan AI',
    'dash.generate_subtitle': 'Diseña tu semana con inteligencia',
    'dash.configure_profile': 'Ajustes de Perfil',
    'dash.configure_subtitle': 'Mantén tus datos actualizados',
    'dash.active_plan': 'Plan Semanal Activo',
    'dash.view_history': 'Ver todos',
    'dash.no_active_plan': 'No tienes un plan activo',
    'dash.no_plan_subtitle': 'Genera uno ahora para empezar a cuidar tu alimentación.',
    'dash.week': 'SEM',
    'dash.smart_plan_title': 'Plan Nutricional Inteligente',
    'dash.in_progress': 'En progreso',
    'dash.daily': 'diarias',
    'dash.created': 'Creado el',
    'dash.shopping_list': 'Lista de compras',
    'dash.delete_confirm': '¿Estás seguro de que deseas eliminar este plan?',
    'dash.delete_success': 'Plan eliminado correctamente',
    'dash.delete_error': 'Error al eliminar el plan',
    'dash.gen_success': '¡Nuevo plan generado!',
    'dash.gen_error': 'No se pudo generar el plan',
    'dash.profile_error': 'Error al cargar tu perfil',
    'dash.welcome_new': '¡Bienvenido! Completa tu perfil para empezar.',
    'dash.no_session': 'No se encontró sesión activa',
    
    // Smart Recommendations
    'rec.title': 'Sugerencias',
    'rec.title_highlight': 'Inteligentes',
    'rec.subtitle': 'Basado en tu perfil y objetivos de salud',
    'rec.loading': 'Buscando recomendaciones personalizadas...',
    'rec.protocol_security': 'Protocolo de Seguridad',
    'rec.biometric_analysis': 'Análisis Biométrico',
    'rec.knowledge_base': 'Base de Conocimiento',
    'rec.general_recommendation': 'Recomendación',
    'rec.ai_engine': 'Motor IA',
    'rec.read_more': 'Leer más',
    
    // Shopping List
    'shop.title': 'Lista de Compra',
    'shop.subtitle': 'Ingredientes para tu semana',
    'shop.back': 'Volver',
    'shop.empty': 'Tu lista está vacía',
    'shop.print': 'Imprimir',
    'shop.share': 'Enviar',
    'shop.weekly_title': 'Tu lista de compra semanal',
    'shop.progress': '{{checked}} de {{total}} productos',
    'shop.custom_section': 'Productos adicionales',
    'shop.add_custom': 'Añadir otro producto...',
    'shop.no_custom': 'No has añadido productos extra.',
    'shop.generated_by': 'Generado por NutriFlow',
    'shop.load_error': 'No se pudo cargar la lista.',
    'shop.delete_item': 'Eliminar producto',
    
    // Categories
    'cat.PROTEIN': 'Proteínas',
    'cat.CARBOHYDRATE': 'Carbohidratos',
    'cat.VEGETABLE': 'Verduras',
    'cat.FRUIT': 'Frutas',
    'cat.DAIRY': 'Lácteos',
    'cat.FAT': 'Grasas',
    'cat.LEGUME': 'Legumbres',
    'cat.GRAIN': 'Cereales',
    'cat.NUT_SEED': 'Frutos secos',
    'cat.CONDIMENT': 'Condimentos',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.delete': 'Eliminar',

    // Plans
    'plans.title': 'Mis Planes',
    'plans.subtitle': 'Gestiona tus planes de dieta semanales',
    'plans.generate': 'Generar nuevo plan',
    'plans.active_title': 'Planes Activos',
    'plans.history_title': 'Historial',
    'plans.no_active': 'No tienes planes activos actualmente.',
    'plans.generate_now': 'Generar uno ahora',
    'plans.week_of': 'Semana del',
    'plans.kcal_day': 'kcal / día',
    'plans.delete_confirm': '¿Estás seguro de que quieres eliminar este plan permanentemente?',
    'plans.status_active': 'Activo',
    'plans.gen_success': 'Plan generado correctamente',
    'plans.del_success': 'Plan eliminado correctamente',
    'plans.load_error': 'Error al cargar los planes',
    'plans.gen_error': 'Error al generar el plan',

    // Auth & Register
    'auth.login_title': 'Bienvenido de nuevo',
    'auth.login_subtitle': 'Inicia sesión para acceder a tu plan',
    'auth.login_input_label': 'Email o nombre de usuario',
    'auth.login_input_placeholder': 'tu@email.com o @username',
    'auth.login_submit': 'Iniciar sesión',
    'auth.no_account': '¿No tienes cuenta?',
    'auth.register_link': 'Regístrate gratis',
    'auth.password_label': 'Contraseña',
    'auth.password_placeholder': '••••••••',
    'auth.error_invalid': 'Credenciales incorrectas. Revisa tu email/usuario y contraseña.',
    'auth.error_user_not_found': 'Usuario no encontrado. Verifica tu nombre de usuario.',
    
    'reg.title': 'Crea tu cuenta',
    'reg.subtitle': 'Empieza a generar tu plan nutricional personalizado',
    'reg.confirm_password': 'Confirmar contraseña',
    'reg.confirm_placeholder': 'Repite tu contraseña',
    'reg.submit': 'Crear cuenta',
    'reg.have_account': '¿Ya tienes cuenta?',
    'reg.login_link': 'Inicia sesión',
    'reg.terms': 'Al registrarte, aceptas que las recomendaciones son orientativas y no sustituyen consejo médico profesional.',
    'reg.success_confirm': '¡Cuenta creada! Revisa tu email para verificar tu cuenta antes de iniciar sesión.',
    'reg.success_direct': '¡Cuenta creada exitosamente! Por favor inicia sesión con tus credenciales.',
    'reg.error_rate_limit': 'Se ha excedido el límite de registros. Por favor, espera unos minutos e intenta nuevamente.',
    'reg.error_exists': 'Este email ya está registrado. Te redirigimos al login.',
    
    'errors.email_invalid': 'Email inválido',
    'errors.pwd_min': 'La contraseña debe tener al menos 8 caracteres',
    'errors.pwd_special': 'Debe incluir al menos un carácter especial',
    'errors.pwd_match': 'Las contraseñas no coinciden',
    'errors.login_input': 'Ingresa tu email o nombre de usuario',
    'errors.login_pwd_min': 'La contraseña debe tener al menos 6 caracteres',

    // Onboarding
    'onboarding.title': 'Configura tu perfil',
    'onboarding.subtitle': 'Necesitamos algunos datos para crear tu plan personalizado',
    'onboarding.step_basics': 'Datos básicos',
    'onboarding.step_activity': 'Actividad',
    'onboarding.step_goals': 'Objetivos',
    'onboarding.step_allergens': 'Alergias',
    'onboarding.username_label': 'Nombre de usuario',
    'onboarding.age_label': 'Edad',
    'onboarding.sex_label': 'Sexo biológico',
    'onboarding.sex_male': 'Masculino',
    'onboarding.sex_female': 'Femenino',
    'onboarding.weight_label': 'Peso actual (kg)',
    'onboarding.height_label': 'Altura (cm)',
    'onboarding.activity_label': 'Nivel de actividad física',
    'onboarding.activity_sedentary': 'Sedentario (poco o nada de ejercicio)',
    'onboarding.activity_light': 'Ligeramente activo (1-3 días/semana)',
    'onboarding.activity_moderate': 'Moderadamente activo (3-5 días/semana)',
    'onboarding.activity_very': 'Muy activo (6-7 días/semana)',
    'onboarding.activity_extreme': 'Extremadamente activo (ejercicio intenso diario)',
    'onboarding.meals_label': 'Comidas por día',
    'onboarding.meals_3': '3 comidas (desayuno, almuerzo, cena)',
    'onboarding.meals_4': '4 comidas (+ 1 snack)',
    'onboarding.meals_5': '5 comidas (+ 2 snacks)',
    'onboarding.diet_label': 'Patrón de dieta',
    'onboarding.diet_omnivore': 'Omnívoro (como de todo)',
    'onboarding.diet_vegetarian': 'Vegetariano',
    'onboarding.diet_vegan': 'Vegano',
    'onboarding.diet_pescatarian': 'Pescatariano',
    'onboarding.goal_weight_label': 'Peso objetivo (kg)',
    'onboarding.current_weight_ref': 'Peso actual',
    'onboarding.disclaimer': 'Las recomendaciones de NutriFlow son orientativas y no sustituyen el consejo de un profesional de la salud. Consulta con tu médico antes de iniciar cualquier plan dietético.',
    'onboarding.allergens_desc': 'Selecciona si tienes alguna alergia o intolerancia alimentaria:',
    'onboarding.allergens_none_found': 'No se encontraron alérgenos disponibles.',
    'onboarding.allergens_selected': 'alérgenos seleccionados',
    'onboarding.allergens_none_selected': 'Sin alergias seleccionadas',
    'onboarding.allergens_plan_avoid': 'Tu plan se generará evitando estos ingredientes.',
    'onboarding.allergens_plan_confirm': 'Confirmas que no tienes restricciones alimentarias conocidas.',
    'onboarding.nav_prev': 'Anterior',
    'onboarding.nav_next': 'Siguiente',
    'onboarding.nav_submit': 'Generar Plan Personalizado',
    'onboarding.loading_profile': 'Guardando perfil...',
    'onboarding.loading_allergens': 'Guardando alergias...',
    'onboarding.loading_plan': 'Generando tu plan personalizado con IA...',
    'onboarding.success': '¡Perfil y plan creados con éxito!',
    'onboarding.quota_error': 'Perfil guardado. La IA está saturada, tu plan se generará en unos minutos.',
    'onboarding.gen_error': 'Perfil guardado, pero hubo un problema al generar el plan inicial.',
    
    'errors.username_short': 'Nombre de usuario muy corto',
    'errors.username_chars': 'Solo letras, números y guiones bajos',
    'errors.age_min': 'Debes tener al menos 18 años',

    // Footer
    'footer.tagline': 'Tu compañero inteligente para una nutrición saludable. Planes personalizados basados en ciencia y adaptados a tu estilo de vida.',
    'footer.product': 'Producto',
    'footer.company': 'Compañía',
    'footer.legal': 'Legal y Contacto',
    'footer.features': 'Características',
    'footer.how_it_works': 'Cómo funciona',
    'footer.pricing': 'Planes y Precios',
    'footer.testimonials': 'Testimonios',
    'footer.about': 'Sobre Nosotros',
    'footer.blog': 'Blog',
    'footer.contact': 'Contacto',
    'footer.careers': 'Carreras',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos de Servicio',
    'footer.cookies': 'Política de Cookies',
    'footer.rights': 'Todos los derechos reservados.',

    // Landing Page
    'landing.hero_badge': 'La app de nutrición #1 basada en IA',
    'landing.hero_title_1': 'Tu dieta perfecta,',
    'landing.hero_title_2': 'sin complicaciones',
    'landing.hero_subtitle': 'Genera planes de alimentación, rutinas de ejercicio y listas de compra adaptados a tus objetivos. Todo sincronizado en una plataforma.',
    'landing.hero_cta': 'Empezar gratis',
    'landing.hero_no_credit': 'Sin tarjeta de crédito requerida',
    'landing.hero_users': 'Más de 10,000 usuarios felices',
    'landing.hero_lunch': 'Almuerzo',
    'landing.hero_macros': 'Macros Diarios',
    'landing.hero_perfect': '+ Perfecto',
    'landing.hero_discover': 'Descubre más',
    'landing.features_title': 'Mucho más que un plan de comidas',
    'landing.features_subtitle_1': 'NutriFlow integra ',
    'landing.features_subtitle_2': 'nutrición, ejercicio y organización',
    'landing.features_subtitle_3': ' en una sola plataforma inteligente.',
    'landing.feat_science_title': 'Ciencia Nutricional',
    'landing.feat_science_desc': 'Cálculo preciso de macros y calorías basado en tus datos biométricos reales.',
    'landing.feat_training_title': 'Entrenamiento Inteligente',
    'landing.feat_training_desc': 'Rutinas de ejercicio generadas por IA que potencian los resultados de tu dieta.',
    'landing.feat_shopping_title': 'Lista de Compra',
    'landing.feat_shopping_desc': 'Olvídate de listas manuales. Genera tu carrito de supermercado en un clic.',
    'landing.feat_learn_more': 'Saber más',
    'landing.how_title_1': 'Planifica tu éxito,',
    'landing.how_title_2': 'comida a comida.',
    'landing.how_desc': 'No dejes tu nutrición al azar. NutriFlow te da el control total sobre tus ingredientes, tiempos de comida y preferencias culinarias.',
    'landing.how_item_1': 'Lista de ingredientes detallada y exportable',
    'landing.how_item_2': 'Instrucciones de preparación paso a paso',
    'landing.how_item_3': 'Alternativas saludables sugeridas por IA',
    'landing.how_cta': 'Ver todas las funcionalidades',
    'landing.how_img_badge': 'Lista de compra generada',
    'landing.how_img_desc': 'Ahorra tiempo en el supermercado con tu lista automática.',
    'landing.cta_title': '¿Listo para transformar tu vida?',
    'landing.cta_desc': 'Únete hoy y obtén tu primer plan nutricional completo en menos de 2 minutos.',
    'landing.cta_button': 'Crear cuenta gratuita',
    'landing.cta_no_credit': 'No requiere tarjeta de crédito',
  },
  en: {
    // Navbar
    'nav.features': 'Features',
    'nav.howItWorks': 'How it Works',
    'nav.dashboard': 'Dashboard',
    'nav.plans': 'Plans',
    'nav.settings': 'Settings',
    'nav.login': 'Log In',
    'nav.startFree': 'Get Started',
    'nav.logout': 'Log Out',
    'nav.profile': 'Profile',
    'nav.login_mobile': 'Log In',
    'nav.register_mobile': 'Create Free Account',
    
    // Dashboard
    'dash.welcome': 'Dashboard',
    'dash.subtitle': 'Your progress and active plans',
    'dash.generate_plan': 'New AI Plan',
    'dash.generate_subtitle': 'Design your week with intelligence',
    'dash.configure_profile': 'Profile Settings',
    'dash.configure_subtitle': 'Keep your data updated',
    'dash.active_plan': 'Active Weekly Plan',
    'dash.view_history': 'View all',
    'dash.no_active_plan': 'No active plan found',
    'dash.no_plan_subtitle': 'Generate one now to start taking care of your diet.',
    'dash.week': 'WEEK',
    'dash.smart_plan_title': 'Smart Nutritional Plan',
    'dash.in_progress': 'In progress',
    'dash.daily': 'daily',
    'dash.created': 'Created on',
    'dash.shopping_list': 'Shopping list',
    'dash.delete_confirm': 'Are you sure you want to delete this plan?',
    'dash.delete_success': 'Plan deleted successfully',
    'dash.delete_error': 'Error deleting plan',
    'dash.gen_success': 'New plan generated!',
    'dash.gen_error': 'Could not generate plan',
    'dash.profile_error': 'Error loading your profile',
    'dash.welcome_new': 'Welcome! Complete your profile to start.',
    'dash.no_session': 'No active session found',
    
    // Smart Recommendations
    'rec.title': 'Smart',
    'rec.title_highlight': 'Recommendations',
    'rec.subtitle': 'Based on your profile and health goals',
    'rec.loading': 'Finding personalized recommendations...',
    'rec.protocol_security': 'Security Protocol',
    'rec.biometric_analysis': 'Biometric Analysis',
    'rec.knowledge_base': 'Knowledge Base',
    'rec.general_recommendation': 'Recommendation',
    'rec.ai_engine': 'AI Engine',
    'rec.read_more': 'Read more',
    
    // Shopping List
    'shop.title': 'Shopping List',
    'shop.subtitle': 'Ingredients for your week',
    'shop.back': 'Back',
    'shop.empty': 'Your list is empty',
    'shop.print': 'Print',
    'shop.share': 'Share',
    'shop.weekly_title': 'Your weekly shopping list',
    'shop.progress': '{{checked}} of {{total}} items',
    'shop.custom_section': 'Additional Items',
    'shop.add_custom': 'Add another item...',
    'shop.no_custom': 'No custom items added.',
    'shop.generated_by': 'Generated by NutriFlow',
    'shop.load_error': 'Could not load the list.',
    'shop.delete_item': 'Delete item',
    
    // Categories
    'cat.PROTEIN': 'Proteins',
    'cat.CARBOHYDRATE': 'Carbohydrates',
    'cat.VEGETABLE': 'Vegetables',
    'cat.FRUIT': 'Fruits',
    'cat.DAIRY': 'Dairy',
    'cat.FAT': 'Fats',
    'cat.LEGUME': 'Legumes',
    'cat.GRAIN': 'Grains',
    'cat.NUT_SEED': 'Nuts & Seeds',
    'cat.CONDIMENT': 'Condiments',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.delete': 'Delete',

    // Plans
    'plans.title': 'My Plans',
    'plans.subtitle': 'Manage your weekly diet plans',
    'plans.generate': 'Generate new plan',
    'plans.active_title': 'Active Plans',
    'plans.history_title': 'History',
    'plans.no_active': 'No active plans found.',
    'plans.generate_now': 'Generate one now',
    'plans.week_of': 'Week of',
    'plans.kcal_day': 'kcal / day',
    'plans.delete_confirm': 'Are you sure you want to delete this plan permanently?',
    'plans.status_active': 'Active',
    'plans.gen_success': 'Plan generated successfully',
    'plans.del_success': 'Plan deleted successfully',
    'plans.load_error': 'Error loading plans',
    'plans.gen_error': 'Error generating plan',

    // Footer
    'footer.tagline': 'Your intelligent companion for healthy nutrition. Personalized plans based on science and adapted to your lifestyle.',
    'footer.product': 'Product',
    'footer.company': 'Company',
    'footer.legal': 'Legal & Contact',
    'footer.features': 'Features',
    'footer.how_it_works': 'How it Works',
    'footer.pricing': 'Plans & Pricing',
    'footer.testimonials': 'Testimonials',
    'footer.about': 'About Us',
    'footer.blog': 'Blog',
    'footer.contact': 'Contact',
    'footer.careers': 'Careers',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.cookies': 'Cookie Policy',
    'footer.rights': 'All rights reserved.',

    // Landing Page
    'landing.hero_badge': '#1 AI-powered nutrition app',
    'landing.hero_title_1': 'Your perfect diet,',
    'landing.hero_title_2': 'made simple',
    'landing.hero_subtitle': 'Generate meal plans, workout routines, and shopping lists tailored to your goals. All synced on one platform.',
    'landing.hero_cta': 'Start for free',
    'landing.hero_no_credit': 'No credit card required',
    'landing.hero_users': 'Over 10,000 happy users',
    'landing.hero_lunch': 'Lunch',
    'landing.hero_macros': 'Daily Macros',
    'landing.hero_perfect': '+ Perfect',
    'landing.hero_discover': 'Discover more',
    'landing.features_title': 'Much more than just a meal plan',
    'landing.features_subtitle_1': 'NutriFlow integrates ',
    'landing.features_subtitle_2': 'nutrition, exercise, and organization',
    'landing.features_subtitle_3': ' into a single intelligent platform.',
    'landing.feat_science_title': 'Nutritional Science',
    'landing.feat_science_desc': 'Precise macro and calorie calculation based on your real biometric data.',
    'landing.feat_training_title': 'Smart Training',
    'landing.feat_training_desc': 'AI-generated workout routines that boost your diet results.',
    'landing.feat_shopping_title': 'Shopping List',
    'landing.feat_shopping_desc': 'Forget manual lists. Generate your grocery cart in one click.',
    'landing.feat_learn_more': 'Learn more',
    'landing.how_title_1': 'Plan your success,',
    'landing.how_title_2': 'meal by meal.',
    'landing.how_desc': "Don't leave your nutrition to chance. NutriFlow gives you total control over your ingredients, meal times, and culinary preferences.",
    'landing.how_item_1': 'Detailed and exportable ingredient list',
    'landing.how_item_2': 'Step-by-step preparation instructions',
    'landing.how_item_3': 'Healthy alternatives suggested by AI',
    'landing.how_cta': 'See all features',
    'landing.how_img_badge': 'Shopping list generated',
    'landing.how_img_desc': 'Save time at the supermarket with your automatic list.',
    'landing.cta_title': 'Ready to transform your life?',
    'landing.cta_desc': 'Join today and get your first complete nutrition plan in less than 2 minutes.',
    'landing.cta_button': 'Create free account',
    'landing.cta_no_credit': 'No credit card required',

    // Auth & Register
    'auth.login_title': 'Welcome Back',
    'auth.login_subtitle': 'Log in to access your plan',
    'auth.login_input_label': 'Email or username',
    'auth.login_input_placeholder': 'you@email.com or @username',
    'auth.login_submit': 'Log In',
    'auth.no_account': "Don't have an account?",
    'auth.register_link': 'Register for free',
    'auth.password_label': 'Password',
    'auth.password_placeholder': '••••••••',
    'auth.error_invalid': 'Invalid credentials. Check your email/username and password.',
    'auth.error_user_not_found': 'User not found. Check your username.',
    
    'reg.title': 'Create your account',
    'reg.subtitle': 'Start generating your personalized nutritional plan',
    'reg.confirm_password': 'Confirm password',
    'reg.confirm_placeholder': 'Repeat your password',
    'reg.submit': 'Create account',
    'reg.have_account': 'Already have an account?',
    'reg.login_link': 'Log In',
    'reg.terms': 'By registering, you agree that recommendations are for guidance only and do not replace professional medical advice.',
    'reg.success_confirm': 'Account created! Check your email to verify your account before logging in.',
    'reg.success_direct': 'Account created successfully! Please log in with your credentials.',
    'reg.error_rate_limit': 'Registration limit exceeded. Please wait a few minutes and try again.',
    'reg.error_exists': 'This email is already registered. Redirecting you to login.',
    
    'errors.email_invalid': 'Invalid email',
    'errors.pwd_min': 'Password must be at least 8 characters',
    'errors.pwd_special': 'Must include at least one special character',
    'errors.pwd_match': 'Passwords do not match',
    'errors.login_input': 'Enter your email or username',
    'errors.login_pwd_min': 'Password must be at least 6 characters',

    // Onboarding
    'onboarding.title': 'Set up your profile',
    'onboarding.subtitle': 'We need some details to create your personalized plan',
    'onboarding.step_basics': 'Basic info',
    'onboarding.step_activity': 'Activity',
    'onboarding.step_goals': 'Goals',
    'onboarding.step_allergens': 'Allergies',
    'onboarding.username_label': 'Username',
    'onboarding.age_label': 'Age',
    'onboarding.sex_label': 'Biological sex',
    'onboarding.sex_male': 'Male',
    'onboarding.sex_female': 'Female',
    'onboarding.weight_label': 'Current weight (kg)',
    'onboarding.height_label': 'Height (cm)',
    'onboarding.activity_label': 'Physical activity level',
    'onboarding.activity_sedentary': 'Sedentary (little or no exercise)',
    'onboarding.activity_light': 'Lightly active (1-3 days/week)',
    'onboarding.activity_moderate': 'Moderately active (3-5 days/week)',
    'onboarding.activity_very': 'Very active (6-7 days/week)',
    'onboarding.activity_extreme': 'Extremely active (intense daily exercise)',
    'onboarding.meals_label': 'Meals per day',
    'onboarding.meals_3': '3 meals (breakfast, lunch, dinner)',
    'onboarding.meals_4': '4 meals (+ 1 snack)',
    'onboarding.meals_5': '5 meals (+ 2 snacks)',
    'onboarding.diet_label': 'Diet pattern',
    'onboarding.diet_omnivore': 'Omnivore (eat everything)',
    'onboarding.diet_vegetarian': 'Vegetarian',
    'onboarding.diet_vegan': 'Vegan',
    'onboarding.diet_pescatarian': 'Pescatarian',
    'onboarding.goal_weight_label': 'Goal weight (kg)',
    'onboarding.current_weight_ref': 'Current weight',
    'onboarding.disclaimer': 'NutriFlow recommendations are for guidance only and do not replace professional health advice. Consult your doctor before starting any dietary plan.',
    'onboarding.allergens_desc': 'Select if you have any food allergies or intolerances:',
    'onboarding.allergens_none_found': 'No available allergens found.',
    'onboarding.allergens_selected': 'allergies selected',
    'onboarding.allergens_none_selected': 'No allergies selected',
    'onboarding.allergens_plan_avoid': 'Your plan will be generated avoiding these ingredients.',
    'onboarding.allergens_plan_confirm': 'You confirm that you have no known dietary restrictions.',
    'onboarding.nav_prev': 'Previous',
    'onboarding.nav_next': 'Next',
    'onboarding.nav_submit': 'Generate Personalized Plan',
    'onboarding.loading_profile': 'Saving profile...',
    'onboarding.loading_allergens': 'Saving allergies...',
    'onboarding.loading_plan': 'Generating your AI-personalized plan...',
    'onboarding.success': 'Profile and plan created successfully!',
    'onboarding.quota_error': 'Profile saved. AI is busy, your plan will be generated in a few minutes.',
    'onboarding.gen_error': 'Profile saved, but there was a problem generating the initial plan.',
    
    'errors.username_short': 'Username too short',
    'errors.username_chars': 'Letters, numbers and underscores only',
    'errors.age_min': 'You must be at least 18 years old',
  }
};

import { createClient } from '@/lib/supabase/client';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');
  const [isLiveTranslating, setIsLiveTranslating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Initial load from localStorage for speed
    const savedLang = localStorage.getItem('nutriflow_lang') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }

    // Then sync with Supabase profile if logged in
    const syncWithProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('language')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.language && profile.language !== savedLang) {
          setLanguage(profile.language as Language);
          localStorage.setItem('nutriflow_lang', profile.language);
        }
      }
    };

    syncWithProfile();
  }, []);

  const handleSetLanguage = async (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('nutriflow_lang', lang);

    // Sync to DB if logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setIsLiveTranslating(true);
      try {
        await supabase
          .from('profiles')
          .update({ language: lang })
          .eq('id', session.user.id);
        
        // Note: Translation bridge trigger will be implemented next
      } finally {
        setIsLiveTranslating(false);
      }
    }
  };

  const t = (key: string): string => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
      {isLiveTranslating && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 bg-surface-900/80 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
           <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
           <span className="text-xs font-medium">NutriFlow IA Translating...</span>
        </div>
      )}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

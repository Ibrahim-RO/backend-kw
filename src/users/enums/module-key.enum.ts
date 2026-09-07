// Módulos del panel que se le pueden asignar a un usuario con perfil
// `marketing` (ver ProfilesGuard + @RequireModule). `admin` siempre tiene
// acceso a todos, sin importar este arreglo. Homepage/Blog ya existen;
// SEO/Marketing se dejan listados para cuando se construyan esas secciones.
export enum ModuleKey {
  HOMEPAGE = 'homepage',
  BLOG = 'blog',
  SEO = 'seo',
  MARKETING = 'marketing',
}

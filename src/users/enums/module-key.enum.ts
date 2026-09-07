// Módulos del panel que se le pueden asignar a un usuario con perfil
// `marketing` (ver ProfilesGuard + @RequireModule). `admin` siempre tiene
// acceso a todos, sin importar este arreglo. Homepage/Blog ya existen;
// SEO/Marketing se dejan listados para cuando se construyan esas secciones.
//
// Homepage además tiene 3 sub-permisos, uno por pestaña de su editor
// (HomepageEditor.tsx): solo tienen efecto si el usuario también trae
// HOMEPAGE en el arreglo — ver HomepageService.mergeAllowed, que usa esto
// para conservar (ignorar el cambio entrante de) la parte del documento que
// el usuario no tiene permiso de tocar, aunque llame al endpoint directo.
export enum ModuleKey {
  HOMEPAGE = 'homepage',
  HOMEPAGE_SECTIONS = 'homepage:sections',
  HOMEPAGE_SEO = 'homepage:seo',
  HOMEPAGE_CODE = 'homepage:code',
  BLOG = 'blog',
  SEO = 'seo',
  MARKETING = 'marketing',
}

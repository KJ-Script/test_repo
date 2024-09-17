export interface NavItem {
  title: string;
  href?: string;
  description?: string;
}

export interface NavItemWithChildren extends NavItem {
  subCategories: NavItem[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  subCategories?: NavItem[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export interface CardProp {
  image_link: string;
  title: string;
  instructor: {
    image: string;
    name: string;
    last_name: string;
  };
  detail: string;
  level: string;
  duration: string;
  lessons: number;
  video_url: string;
  slug: string;
  about: string;
  requirements: string[];
  target: string[];
  content: {
    section: string;
    lectures: string[];
  }[];
}

export interface CourseDetail {
  image_link: string;
  title: string;
  instructor: string;
  detail: string;
  video_url: string;
  slug: string;
}

export interface courseIntroType {
  video_url: string;
  course_title: string;
  instructor: string;
  description: string;
  level: string;
  duration: string;
  lessons: number;
  course_id: number;
  price: number;
}

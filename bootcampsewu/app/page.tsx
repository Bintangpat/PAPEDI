import Image from "next/image";
import { ArrowRight, BookOpen, Code, Award } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="bg-background text-foreground selection:bg-primary/20 min-h-screen font-sans">
      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Code className="text-primary-foreground h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">SkillUp.</span>
        </div>
        <div className="text-muted-foreground hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#" className="hover:text-primary transition-colors">
            Katalog
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Mentor
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Sertifikasi
          </a>
        </div>
        <div className="flex w-fit flex-row gap-4">
          <Link href={"/auth/login"}>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 py-2 text-sm font-medium transition-all">
              Masuk
            </button>
          </Link>
          <Link href={"/auth/register"}>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 py-2 text-sm font-medium transition-all">
              Daftar
            </button>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-8 lg:grid-cols-2">
            <div className="flex flex-col gap-8">
              <div className="border-primary/20 bg-primary/10 text-primary inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                  <span className="bg-primary relative inline-flex h-2 w-2 rounded-full"></span>
                </span>
                Batch 5 Kini Dibuka
              </div>
              <h1 className="text-6xl leading-[1.1] font-extrabold tracking-tighter md:text-7xl">
                Kuasai Skill Digital <br />
                <span className="text-outline text-primary">
                  Berbasis Proyek.
                </span>
              </h1>
              <p className="text-muted-foreground max-w-lg text-xl leading-relaxed">
                Belajar Web Dev, SEO, dan Social Media langsung dari praktisi
                industri. Bangun portofolio nyata dan raih sertifikasi
                internasional.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/20 flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-bold transition-all hover:shadow-xl">
                  Mulai Belajar Sekarang <ArrowRight className="h-5 w-5" />
                </button>
                <button className="border-border bg-background hover:bg-accent/50 flex items-center justify-center gap-2 rounded-2xl border px-8 py-4 text-lg font-bold transition-all">
                  Lihat Kurikulum
                </button>
              </div>
              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="border-background bg-muted h-8 w-8 overflow-hidden rounded-full border-2 shadow-sm"
                    >
                      <Image
                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                        alt="avatar"
                        width={32}
                        height={32}
                      />
                    </div>
                  ))}
                </div>
                <p>
                  Bergabung dengan <b>2,400+</b> siswa lainnya
                </p>
              </div>
            </div>

            <div className="relative">
              {/* Dekoratif Background */}
              <div className="animate-blob bg-primary absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-20 mix-blend-multiply blur-3xl filter"></div>
              <div className="animate-blob animation-delay-2000 bg-primary absolute -bottom-20 -left-20 h-72 w-72 rounded-full opacity-20 mix-blend-multiply blur-3xl filter"></div>

              <div className="border-muted/20 bg-card relative overflow-hidden rounded-[2.5rem] border-8 p-4 shadow-2xl">
                <div className="bg-muted/50 flex aspect-video items-center justify-center overflow-hidden rounded-[1.8rem]">
                  {/* Placeholder Video/Image */}
                  <Image
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072"
                    alt="Coding Bootcamp"
                    width={800}
                    height={450}
                    className="object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-transform hover:scale-110">
                      <div className="ml-1 h-0 w-0 border-t-8 border-b-8 border-l-15 border-t-transparent border-b-transparent border-l-white"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/30 py-24">
          <div className="mx-auto max-w-7xl px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold">
                Kenapa Belajar di SkillUp?
              </h2>
              <p className="text-muted-foreground">
                Sistem belajar yang dirancang khusus untuk mempercepat karir
                digital Anda.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "Kurikulum Industri",
                  desc: "Materi yang selalu update sesuai kebutuhan pasar kerja saat ini.",
                  icon: <BookOpen className="text-primary" />,
                },
                {
                  title: "Project-Based",
                  desc: "Bukan sekadar nonton video, Anda membangun aplikasi nyata setiap minggu.",
                  icon: <Code className="text-primary" />,
                },
                {
                  title: "Sertifikasi Resmi",
                  desc: "Dapatkan sertifikat yang dapat diverifikasi publik untuk CV & LinkedIn.",
                  icon: <Award className="text-primary" />,
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="border-border bg-card hover:border-primary/50 rounded-[2rem] border p-10 transition-all hover:shadow-lg"
                >
                  <div className="bg-primary/10 mb-6 flex h-12 w-12 items-center justify-center rounded-2xl">
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-border border-t py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 md:flex-row">
          <p className="text-muted-foreground text-sm">
            © 2026 SkillUp Bootcamp Platform. All rights reserved.
          </p>
          <div className="text-muted-foreground/80 flex gap-8 text-sm font-medium">
            <a href="#" className="hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms of Service
            </a>
            <a href="#" className="hover:text-foreground">
              Contact Admin
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

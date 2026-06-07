import { appConfig } from '@/config/appConfig';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-bold text-slate-950">Uttam Kumar</p>
          <p>Java Backend Developer</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <a className="font-semibold text-blue-700 hover:underline" href={appConfig.portfolioUrl} target="_blank" rel="noreferrer">
            Portfolio
          </a>
          <a className="font-semibold text-blue-700 hover:underline" href={appConfig.productUrl} target="_blank" rel="noreferrer">
            Main Product
          </a>
          <a className="font-semibold text-blue-700 hover:underline" href={appConfig.githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

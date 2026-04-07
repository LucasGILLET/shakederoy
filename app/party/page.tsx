'use client';

import { Button } from '@/app/components/Button';
import { useAuth } from '@/app/context/AuthContext';
import {
  createPartySession,
  getPartySessionByCode,
  joinPartySession,
  listPartyParticipants,
} from '@/app/lib/partyApi';
import { ArrowRight, LogIn, RefreshCw, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';

function generatePartyCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function PartyModeEntryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [createName, setCreateName] = useState('');
  const [createCode, setCreateCode] = useState(generatePartyCode);
  const [joinCode, setJoinCode] = useState('');
  const [joinDisplayName, setJoinDisplayName] = useState('');
  const [createError, setCreateError] = useState('');
  const [joinError, setJoinError] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const authMessage = useMemo(() => {
    if (loading) return 'Verification de la session en cours...';
    if (user) return `Connecte en tant que ${user.username}.`;
    return 'Le back exige une session authentifiee pour creer, rejoindre et generer.';
  }, [loading, user]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setCreateError('Connecte-toi pour creer une soiree.');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      const session = await createPartySession({
        code: createCode.trim().toUpperCase(),
        name: createName.trim() || undefined,
      });

      router.push(`/party/${session.id}?created=1`);
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Creation impossible.'
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setJoinError('Connecte-toi pour rejoindre une soiree.');
      return;
    }

    setJoining(true);
    setJoinError('');

    try {
      const session = await getPartySessionByCode(joinCode.trim().toUpperCase());
      const participants = await listPartyParticipants(session.id);
      const existingParticipant = participants.find(
        (participant) => participant.user_id === user.id
      );

      if (!existingParticipant) {
        await joinPartySession(session.id, {
          userId: user.id,
          guestName: joinDisplayName.trim() || user.username,
        });
      }

      router.push(`/party/${session.id}?joined=1`);
    } catch (error) {
      setJoinError(
        error instanceof Error ? error.message : 'Impossible de rejoindre la soiree.'
      );
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),_transparent_30%),linear-gradient(135deg,_#fff7ed,_#fffbeb_45%,_#ffffff)] py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
        <section className="rounded-[2rem] border-4 border-brand-dark bg-white/90 p-8 shadow-[10px_10px_0_0_rgba(31,41,55,0.12)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <h1 className="font-display text-5xl text-brand-dark md:text-6xl">
                Mode soirée
              </h1>
              <p className="text-lg text-slate-700">
                Cree une session reelle, rejoins-la avec un code, puis pilote les
                preferences, la generation des cocktails et la vue barman depuis
                les endpoints existants.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              {authMessage}
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-[2rem] border-4 border-brand-dark bg-white p-8 shadow-[8px_8px_0_0_rgba(251,146,60,0.16)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-3xl text-brand-dark">
                  Creer une soiree
                </h2>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleCreate}>
              <label className="block space-y-2">
                <span className="text-sm font-bold uppercase tracking-wide text-slate-700">
                  Nom de la soiree
                </span>
                <input
                  className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3 outline-none transition focus:border-brand-primary"
                  placeholder="Ex: Afterwork M2"
                  value={createName}
                  onChange={(event) => setCreateName(event.target.value)}
                />
              </label>

              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <label className="block space-y-2">
                  <span className="text-sm font-bold uppercase tracking-wide text-slate-700">
                    Code session
                  </span>
                  <input
                    className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3 font-mono text-lg uppercase outline-none transition focus:border-brand-primary"
                    minLength={4}
                    required
                    value={createCode}
                    onChange={(event) =>
                      setCreateCode(event.target.value.toUpperCase())
                    }
                  />
                </label>

                <Button
                  className="mt-auto justify-center"
                  type="button"
                  variant="outline"
                  onClick={() => setCreateCode(generatePartyCode())}
                >
                  Regenerer <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {createError ? (
                <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {createError}
                </p>
              ) : null}

              <Button
                className="w-full justify-center"
                size="lg"
                disabled={creating || loading || !user}
                type="submit"
              >
                {creating ? 'Creation...' : 'Creer la session'}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </form>
          </article>

          <article className="rounded-[2rem] border-4 border-brand-dark bg-white p-8 shadow-[8px_8px_0_0_rgba(59,130,246,0.16)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                <LogIn className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-3xl text-brand-dark">
                  Rejoindre une soiree
                </h2>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleJoin}>
              <label className="block space-y-2">
                <span className="text-sm font-bold uppercase tracking-wide text-slate-700">
                  Code session
                </span>
                <input
                  className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3 font-mono text-lg uppercase outline-none transition focus:border-brand-primary"
                  minLength={4}
                  placeholder="ABCD12"
                  required
                  value={joinCode}
                  onChange={(event) =>
                    setJoinCode(event.target.value.toUpperCase())
                  }
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-bold uppercase tracking-wide text-slate-700">
                  Nom affiche
                </span>
                <input
                  className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3 outline-none transition focus:border-brand-primary"
                  placeholder={user?.username ?? 'Ton nom pour la soiree'}
                  value={joinDisplayName}
                  onChange={(event) => setJoinDisplayName(event.target.value)}
                />
              </label>

              {joinError ? (
                <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {joinError}
                </p>
              ) : null}

              <Button
                className="w-full justify-center"
                size="lg"
                disabled={joining || loading || !user}
                type="submit"
              >
                {joining ? 'Connexion...' : 'Rejoindre la session'}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </form>
          </article>
        </section>
      </div>
    </div>
  );
}

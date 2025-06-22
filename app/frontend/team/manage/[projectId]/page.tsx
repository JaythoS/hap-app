"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users, Crown, Shield, User, Mail, UserPlus, MoreVertical, Calendar, MapPin, GraduationCap, Trash2 } from "lucide-react"
import Header from "@/app/frontend/components/Header"
import { useAuth } from "@/app/hooks/useAuth"

interface TeamMember {
  id: number
  role: 'LEADER' | 'ADMIN' | 'MEMBER'
  status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'REMOVED'
  joinedAt: string | null
  user: {
    id: number
    adsoyad: string
    email: string
    profilFoto: string | null
    userType: string
  }
}

interface TeamInvitation {
  id: number
  inviteeEmail: string
  message: string | null
  status: string
  createdAt: string
  inviter: {
    id: number
    adsoyad: string
  }
  invitee: {
    id: number
    adsoyad: string
    email: string
  } | null
}

interface TeamData {
  team: {
    id: number
    name: string
    description: string | null
    createdAt: string
    project: {
      id: number
      projeAdi: string
      projeKonusu: string
      projeOzeti: string
      resim: string | null
      katilimIli: string
      takimKurulusYili: number
      takimEgitimSeviyesi: string
      createdAt: string
    }
    members: TeamMember[]
    invitations: TeamInvitation[]
  }
  stats: {
    totalMembers: number
    activeMembers: number
    pendingMembers: number
    pendingInvitations: number
    leaders: number
    admins: number
    regularMembers: number
  }
}

export default function TeamManagePage({ params }: { params: Promise<{ projectId: string }> }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  const [teamData, setTeamData] = useState<TeamData | null>(null)
  const [loadingTeam, setLoadingTeam] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteMessage, setInviteMessage] = useState("")
  const [isInviting, setIsInviting] = useState(false)

  // Takım verilerini yükle
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const resolvedParams = await params
        const response = await fetch(`/api/team/${resolvedParams.projectId}`)
        
        if (!response.ok) {
          throw new Error('Takım bilgileri yüklenemedi')
        }
        
        const data = await response.json()
        setTeamData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      } finally {
        setLoadingTeam(false)
      }
    }

    fetchTeamData()
  }, [params])

  // Üye davet et
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inviteEmail || !user || !teamData) return

    setIsInviting(true)
    try {
      const resolvedParams = await params
      const response = await fetch(`/api/team/${resolvedParams.projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          message: inviteMessage,
          inviterId: user.id
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert('Davet başarıyla gönderildi!')
        setShowInviteModal(false)
        setInviteEmail("")
        setInviteMessage("")
        // Takım verilerini yenile
        window.location.reload()
      } else {
        alert(result.error || 'Davet gönderilirken hata oluştu')
      }
    } catch (error) {
      console.error('Invite error:', error)
      alert('Sunucu hatası oluştu')
    } finally {
      setIsInviting(false)
    }
  }

  // Üye yetkisini değiştir
  const handleRoleChange = async (memberId: number, newRole: 'LEADER' | 'ADMIN' | 'MEMBER') => {
    if (!user || !teamData) return

    try {
      const resolvedParams = await params
      const response = await fetch(`/api/team/${resolvedParams.projectId}/member/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: newRole,
          updatedBy: user.id
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert('Üye yetkisi başarıyla güncellendi!')
        // Takım verilerini yenile
        window.location.reload()
      } else {
        alert(result.error || 'Yetki güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Role change error:', error)
      alert('Sunucu hatası oluştu')
    }
  }

  // Takımdan üye at (sadece LEADER)
  const handleRemoveMember = async (memberId: number, memberName: string) => {
    if (!user || !teamData) return

    const confirmRemove = confirm(`${memberName} adlı üyeyi takımdan atmak istediğinizden emin misiniz?`)
    if (!confirmRemove) return

    try {
      const resolvedParams = await params
      const response = await fetch(`/api/team/${resolvedParams.projectId}/member/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          removedBy: user.id
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert('Üye başarıyla takımdan atıldı!')
        // Takım verilerini yenile
        window.location.reload()
      } else {
        alert(result.error || 'Üye atılırken hata oluştu')
      }
    } catch (error) {
      console.error('Remove member error:', error)
      alert('Sunucu hatası oluştu')
    }
  }

  // Rol ikonunu getir
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'LEADER':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return <User className="w-4 h-4 text-gray-400" />
    }
  }

  // Rol adını getir
  const getRoleName = (role: string) => {
    switch (role) {
      case 'LEADER':
        return 'Lider'
      case 'ADMIN':
        return 'Yönetici'
      default:
        return 'Üye'
    }
  }

  // Status rengini getir
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-500'
      case 'PENDING':
        return 'text-yellow-500'
      default:
        return 'text-gray-500'
    }
  }

  // Kullanıcının takımdaki rolünü kontrol et
  const currentUserMember = teamData?.team.members.find(m => m.user.id === user?.id)
  const canInviteMembers = currentUserMember && (currentUserMember.role === 'LEADER' || currentUserMember.role === 'ADMIN')
  const canRemoveMembers = currentUserMember && currentUserMember.role === 'LEADER'

  if (loading || loadingTeam) {
    return (
      <div className="min-h-screen bg-[#1A1B1E] flex items-center justify-center">
        <div className="text-white">Yükleniyor...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/frontend/registerPage')
    return null
  }

  if (error || !teamData) {
    return (
      <div className="min-h-screen bg-[#1A1B1E] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error || 'Takım bilgileri yüklenemedi'}</div>
          <button 
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white"
          >
            Geri Dön
          </button>
        </div>
      </div>
    )
  }

  // Kullanıcının takım üyesi olup olmadığını kontrol et
  if (!currentUserMember) {
    return (
      <div className="min-h-screen bg-[#1A1B1E] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">Bu takıma erişim yetkiniz yok</div>
          <button 
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white"
          >
            Geri Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1B1E] text-white">
      <Header />
      
      <main className="px-4 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Geri Dön
          </button>
          
          {canInviteMembers && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Üye Davet Et
            </button>
          )}
        </div>

        {/* Proje Bilgileri */}
        <div className="bg-[#2C2D31] rounded-xl p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Proje Resmi */}
            <div className="flex-shrink-0">
              {teamData.team.project.resim ? (
                <img 
                  src={teamData.team.project.resim} 
                  alt={teamData.team.project.projeAdi}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-600"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Proje Detayları */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{teamData.team.project.projeAdi}</h1>
              <p className="text-blue-400 mb-3">{teamData.team.project.projeKonusu}</p>
              <p className="text-gray-300 mb-4 line-clamp-3">{teamData.team.project.projeOzeti}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {teamData.team.project.katilimIli}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {teamData.team.project.takimKurulusYili}
                </div>
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  {teamData.team.project.takimEgitimSeviyesi}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Takım İstatistikleri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#2C2D31] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{teamData.stats.totalMembers}</div>
            <div className="text-sm text-gray-400">Toplam Üye</div>
          </div>
          <div className="bg-[#2C2D31] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{teamData.stats.pendingInvitations + teamData.stats.pendingMembers}</div>
            <div className="text-sm text-gray-400">Bekleyen Davet</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Takım Üyeleri */}
          <div className="lg:col-span-2">
            <div className="bg-[#2C2D31] rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Takım Üyeleri ({teamData.stats.totalMembers})
              </h2>
              
              <div className="space-y-3">
                {teamData.team.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-[#1A1B1E] rounded-lg">
                    <div className="flex items-center gap-3">
                      {/* Profil Fotoğrafı */}
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                        {member.user.profilFoto ? (
                          <img 
                            src={member.user.profilFoto} 
                            alt={member.user.adsoyad}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Kullanıcı Bilgileri */}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {member.user.adsoyad}
                          {member.status === 'PENDING' && (
                            <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">
                              Bekliyor
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">{member.user.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Rol */}
                      <div className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        <span className="text-sm">{getRoleName(member.role)}</span>
                      </div>
                      
                      {/* Katılma Tarihi */}
                      {member.joinedAt && (
                        <div className="text-xs text-gray-500">
                          {new Date(member.joinedAt).toLocaleDateString('tr-TR')}
                        </div>
                      )}
                      
                      {/* Yetki Değiştirme Butonu - Sadece ACTIVE üyeler için */}
                      {canInviteMembers && member.user.id !== user?.id && member.status === 'ACTIVE' && (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as 'LEADER' | 'ADMIN' | 'MEMBER')}
                          className="text-xs bg-[#2C2D31] border border-gray-600 rounded px-2 py-1 text-white"
                        >
                          <option value="MEMBER">Üye</option>
                          <option value="ADMIN">Yönetici</option>
                          <option value="LEADER">Lider</option>
                        </select>
                      )}
                      
                      {/* Takımdan Atma Butonu - Sadece LEADER ve ACTIVE üyeler için */}
                      {canRemoveMembers && member.user.id !== user?.id && member.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRemoveMember(member.id, member.user.adsoyad)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                          title="Takımdan At"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bekleyen Davetler */}
          <div>
            <div className="bg-[#2C2D31] rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Bekleyen Davetler ({teamData.stats.pendingInvitations + teamData.stats.pendingMembers})
              </h2>
              
              <div className="space-y-3">
                {/* Normal Davetler (TeamInvitation) */}
                {teamData.team.invitations.map((invitation) => (
                  <div key={`invitation-${invitation.id}`} className="p-3 bg-[#1A1B1E] rounded-lg">
                    <div className="font-medium text-sm mb-1 flex items-center gap-2">
                      {invitation.invitee?.adsoyad || invitation.inviteeEmail}
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                        Email Daveti
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      {invitation.inviter.adsoyad} tarafından davet edildi
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(invitation.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                ))}
                
                {/* Yeniden Davet Edilenler (PENDING Members) */}
                {teamData.team.members
                  .filter(member => member.status === 'PENDING')
                  .map((member) => (
                    <div key={`pending-${member.id}`} className="p-3 bg-[#1A1B1E] rounded-lg">
                      <div className="font-medium text-sm mb-1 flex items-center gap-2">
                        {member.user.adsoyad}
                        <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">
                          Yeniden Davet
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        {member.user.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        Davet yanıtı bekleniyor
                      </div>
                    </div>
                  ))}
                
                {/* Hiç bekleyen davet yoksa */}
                {teamData.team.invitations.length === 0 && 
                 teamData.team.members.filter(m => m.status === 'PENDING').length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Bekleyen davet yok
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Davet Modalı */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2C2D31] rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Takıma Üye Davet Et</h3>
            
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email Adresi
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Davet Mesajı (Opsiyonel)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="w-full bg-[#1A1B1E] border border-gray-600 rounded-lg p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Takımımıza katılmak ister misin?"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isInviting ? 'Gönderiliyor...' : 'Davet Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 
"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Heart, Lock, Users, MessageCircle, Shield, ArrowLeft, Send } from "lucide-react"

interface Message {
  id: string
  sender: "user" | "ai"
  content: string
  timestamp: Date
  avatar?: string
}

export default function ConanChatRooms() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatRooms = [
    {
      id: "detective-room",
      title: "侦探推理室",
      englishTitle: "Detective Reasoning Room",
      icon: Search,
      bgColor: "from-blue-500 to-blue-600",
      character: "江户川柯南",
      characterAvatar: "🕵️",
      description: "与柯南一起解开复杂案件，运用逻辑推理和观察力破解谜团。",
      aiRole: "名侦探，逻辑推理专家",
      onlineCount: 1247,
      status: "高峰期间",
      statusColor: "bg-green-500",
      welcomeMessage: "你好！我是江户川柯南，一个高中生侦探。有什么案件需要我帮忙分析吗？",
      systemPrompt: "你是一个高中生侦探，名叫江户川柯南。你擅长逻辑推理和观察细节。请用柯南的语气和风格回答问题，经常使用'真相只有一个'等经典台词。",
    },
    {
      id: "detective-boys",
      title: "少年侦探团",
      englishTitle: "Detective Boys Club",
      icon: Heart,
      bgColor: "from-pink-500 to-red-500",
      character: "吉田步美",
      characterAvatar: "👧",
      description: "加入少年侦探团，与步美一起冒险探索，体验纯真的友谊。",
      aiRole: "少年侦探团成员，活泼可爱",
      onlineCount: 892,
      status: "安全聊天",
      statusColor: "bg-blue-500",
      welcomeMessage: "大家好！我是吉田步美，少年侦探团的一员！我们一起去冒险吧！",
      systemPrompt: "你是吉田步美，少年侦探团的一员。你活泼可爱，充满好奇心，经常用'哇！'、'好有趣！'等感叹词。你崇拜柯南，经常提到他。",
    },
    {
      id: "black-org",
      title: "黑衣组织情报",
      englishTitle: "Black Organization Intel",
      icon: Lock,
      bgColor: "from-purple-600 to-purple-700",
      character: "灰原哀",
      characterAvatar: "👩‍🔬",
      description: "与灰原哀交流机密情报，分析黑衣组织的动向和威胁。",
      aiRole: "前黑衣组织成员，科学分析专家",
      onlineCount: 156,
      status: "顶级安全",
      statusColor: "bg-purple-500",
      welcomeMessage: "...你想了解黑衣组织的情报吗？小心，知道太多可能会很危险。",
      systemPrompt: "你是灰原哀，前黑衣组织成员，现为少年侦探团成员。你性格冷静，说话简洁，经常用省略号。你精通科学，特别是药物研究。",
    },
  ]

  const currentRoom = chatRooms.find((room) => room.id === selectedRoom)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (selectedRoom && messages.length === 0) {
      // Add welcome message when entering a room
      const room = chatRooms.find((r) => r.id === selectedRoom)
      if (room) {
        setMessages([
          {
            id: "1",
            sender: "ai",
            content: room.welcomeMessage,
            timestamp: new Date(),
            avatar: room.characterAvatar,
          },
        ])
      }
    }
  }, [selectedRoom])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentRoom) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: inputMessage,
      timestamp: new Date(),
      avatar: "👤",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: currentRoom.systemPrompt },
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            { role: 'user', content: inputMessage }
          ],
        }),
      })

      const data = await response.json()
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: data.choices[0].message.content,
        timestamp: new Date(),
        avatar: currentRoom.characterAvatar,
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Error:', error)
      // 如果API调用失败，使用备用回复
      const fallbackResponses = [
        "抱歉，我现在无法回应。",
        "让我想想...",
        "这个问题很有趣...",
        "我需要更多信息。",
      ]
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        timestamp: new Date(),
        avatar: currentRoom.characterAvatar,
      }
      setMessages((prev) => [...prev, aiMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleBackToRooms = () => {
    setSelectedRoom(null)
    setMessages([])
    setInputMessage("")
    setIsTyping(false)
  }

  if (selectedRoom && currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Chat Header */}
        <div className={`bg-gradient-to-r ${currentRoom.bgColor} p-4 shadow-lg`}>
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToRooms} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg">
                {currentRoom.characterAvatar}
              </div>
              <div>
                <h2 className="text-white font-bold">{currentRoom.character}</h2>
                <p className="text-white/80 text-sm">{currentRoom.aiRole}</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge className="bg-white/20 text-white">
                <Users className="w-3 h-3 mr-1" />
                {currentRoom.onlineCount}
              </Badge>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "ai" && (
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    {message.avatar}
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-white border border-white/20"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-400"}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.sender === "user" && (
                  <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    {message.avatar}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-sm">
                  {currentRoom.characterAvatar}
                </div>
                <div className="bg-white/10 text-white border border-white/20 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`与${currentRoom.character}对话...`}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Original room selection interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold text-white mb-2">名侦探柯南聊天室</h1>
          <p className="text-blue-200 text-lg">Detective Conan Chat Rooms</p>
          <div className="w-16 h-1 bg-blue-400 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Chat Room Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {chatRooms.map((room) => {
            const IconComponent = room.icon
            return (
              <Card
                key={room.id}
                className="overflow-hidden bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
              >
                {/* Card Header with Gradient */}
                <div className={`bg-gradient-to-r ${room.bgColor} p-6 text-white`}>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <IconComponent className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-1">{room.title}</h3>
                  <p className="text-center text-white/80 text-sm">{room.englishTitle}</p>
                </div>

                <CardContent className="p-6 text-white">
                  {/* Character Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-lg">
                      {room.characterAvatar}
                    </div>
                    <span className="font-medium">{room.character}</span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">{room.description}</p>

                  {/* AI Role */}
                  <div className="mb-4">
                    <span className="text-blue-300 text-sm">AI角色: </span>
                    <span className="text-gray-300 text-sm">{room.aiRole}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">{room.onlineCount} 在线</span>
                    </div>
                    <Badge className={`${room.statusColor} text-white text-xs`}>{room.status}</Badge>
                  </div>

                  {/* Chat Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium"
                    onClick={() => setSelectedRoom(room.id)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />与{room.character}聊天
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Famous Quote */}
        <div className="text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-lg px-8 py-4 border border-white/20">
            <p className="text-white text-lg font-medium mb-1">"真相只有一个！" - 江户川柯南</p>
            <p className="text-blue-200 text-sm">"There is only one truth!" - Edogawa Conan</p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">安全聊天</span>
            </div>
            <p className="text-gray-300 text-sm">AI智能监控，确保聊天环境安全</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">推理模式</span>
            </div>
            <p className="text-gray-300 text-sm">与AI角色一起解决推理谜题</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">多人互动</span>
            </div>
            <p className="text-gray-300 text-sm">与其他柯南迷一起讨论剧情</p>
          </div>
        </div>
      </div>
    </div>
  )
}

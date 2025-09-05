# Feed com Mídia - Guia de Implementação

## 🎯 Nova Funcionalidade: Posts com Fotos e Vídeos

Transformamos o feed do DevForum para suportar posts multimídia, permitindo que os usuários compartilhem imagens e vídeos junto com suas perguntas.

## 📸 Funcionalidades Implementadas

### 1. Upload de Mídia
- **Múltiplos arquivos**: Suporte para upload de várias imagens/vídeos
- **Preview instantâneo**: Visualização antes de publicar
- **Formatos suportados**: JPG, PNG, GIF, MP4, WebM
- **Tamanho do arquivo**: Exibido em MB para cada mídia

### 2. Exibição no Feed

#### Layout Único (1 mídia)
```
┌─────────────────────────┐
│                         │
│    Imagem ou Vídeo     │
│     (tela cheia)       │
│                         │
└─────────────────────────┘
```

#### Layout Grid (2-4 mídias)
```
┌───────────┬───────────┐
│ Imagem 1  │ Imagem 2  │
├───────────┼───────────┤
│ Imagem 3  │ Imagem 4  │
└───────────┴───────────┘
```

#### Mais de 4 mídias
- Mostra as 4 primeiras
- Indicador "+N" na última imagem

### 3. Visualização em Tela Cheia
- **Click para expandir**: Imagens abrem em modal
- **Informações da mídia**: Nome e tamanho do arquivo
- **Fechar**: Botão X ou click fora da imagem

### 4. Controles de Vídeo
- **Player nativo**: Controles padrão do navegador
- **Responsivo**: Adapta ao tamanho da tela
- **Autoplay desabilitado**: Para melhor UX

## 🛠️ Como Usar

### Para Criar um Post com Mídia

1. Click em "Nova Pergunta"
2. Preencha título e descrição
3. Click em "Adicionar Foto" ou "Adicionar Vídeo"
4. Selecione os arquivos
5. Veja o preview
6. Click em "Publicar"

### Para Remover Mídia

- Passe o mouse sobre o preview
- Click no X vermelho

## 📱 Interface do Modal de Criação

```
┌─────────────────────────────────────┐
│ Nova Pergunta                    X  │
├─────────────────────────────────────┤
│ Título                              │
│ [_________________________________] │
│                                     │
│ Descrição                           │
│ [_________________________________] │
│ [_________________________________] │
│                                     │
│ Tags                                │
│ [_________________________________] │
│                                     │
│ Mídia (opcional)                    │
│ [📷 Adicionar Foto] [▶ Add Vídeo]  │
│                                     │
│ ┌─────────┐ ┌─────────┐            │
│ │ Preview │ │ Preview │            │
│ │   IMG   │ │  VIDEO  │            │
│ │ 2.1 MB  │ │ 15.3 MB │            │
│ └─────────┘ └─────────┘            │
│                                     │
│ [Publicar]  [Cancelar]              │
└─────────────────────────────────────┘
```

## 🎨 Personalização

### Mudar limite de arquivos

Em `FeedView.jsx`:
```javascript
// No input de arquivo
<input
  type="file"
  accept="image/*,video/*"
  multiple
  max="10" // Adicione limite
/>
```

### Adicionar validação de tamanho

```javascript
const handleFileUpload = (e) => {
  const files = Array.from(e.target.files);
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  
  files.forEach(file => {
    if (file.size > MAX_SIZE) {
      alert('Arquivo muito grande! Máximo 50MB');
      return;
    }
    // ... resto do código
  });
};
```

### Modificar grid de imagens

```javascript
// Para layout 3 colunas
<div className={`grid gap-1 ${
  item.media.length === 2 ? 'grid-cols-2' : 
  'grid-cols-3' // Mude aqui
}`}>
```

## 🚀 Melhorias Futuras

### 1. Upload para Servidor
```javascript
// Substituir FileReader por upload real
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};
```

### 2. Compressão de Imagens
- Reduzir tamanho antes do upload
- Gerar thumbnails
- Lazy loading

### 3. Editor de Imagens
- Crop
- Filtros
- Rotação
- Anotações

### 4. Galeria Avançada
- Swipe entre imagens
- Zoom com gestos
- Download
- Compartilhar direto

### 5. Suporte a Mais Formatos
- GIFs animados
- Documentos (PDF, DOC)
- Áudio
- Embeds (YouTube, Vimeo)

## 📊 Dados de Exemplo

O feed já vem com posts de exemplo que incluem mídia:
- **A cada 3 posts**: Uma imagem única
- **A cada 5 posts**: Grid com 3 imagens
- Imagens via Lorem Picsum (placeholder)

## 🐛 Troubleshooting

### Imagens não aparecem
- Verifique conexão com internet (Lorem Picsum)
- Confirme que `item.media` existe

### Upload não funciona
- Verifique se `fileInputRef` está definido
- Confirme formatos aceitos no input

### Modal não fecha
- Verifique se `setShowImagePreview(null)` está sendo chamado
- Confirme z-index do modal

## 🎉 Resultado

O feed agora é muito mais rico e interativo! Os usuários podem:
- Compartilhar screenshots de código
- Mostrar erros visuais
- Demonstrar UI/UX
- Criar tutoriais visuais
- Engajar mais com conteúdo visual

A experiência se aproxima de redes sociais modernas, mantendo o foco técnico do DevForum!

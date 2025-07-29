
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getFaqs, addFaq, updateFaq, getPinCodes, addPinCode, updatePinCode, getMedia, addMedia, updateMedia } from "@/lib/db";
import { PlusCircle } from "lucide-react";

type FaqItem = { id: number; question: string; answer: string; };
type PinCodeData = Record<string, string>;
type MediaItem = { id: number; title: string; type: 'video' | 'image' | 'reel'; url: string; };

export default function ContentPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [pinCodeData, setPinCodeData] = useState<PinCodeData>({});
  const [media, setMedia] = useState<MediaItem[]>([]);

  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<{ id?: number, question: string, answer: string } | null>(null);

  const [isPinCodeDialogOpen, setIsPinCodeDialogOpen] = useState(false);
  const [currentPinCode, setCurrentPinCode] = useState<{ pincode: string, info: string, isEditing: boolean } | null>(null);

  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<Partial<MediaItem> | null>(null);

  async function loadContent() {
      setFaqs(await getFaqs());
      setPinCodeData(await getPinCodes());
      setMedia(await getMedia());
  }

  useEffect(() => {
    loadContent();
  }, []);

  const handleOpenFaqDialog = (faq: FaqItem | null = null) => {
    setCurrentFaq(faq ? { ...faq } : { question: '', answer: '' });
    setIsFaqDialogOpen(true);
  };

  const handleSaveFaq = async () => {
    if (!currentFaq) return;
    
    if (currentFaq.id !== undefined) {
      await updateFaq(currentFaq.id, currentFaq.question, currentFaq.answer);
    } else {
      await addFaq(currentFaq.question, currentFaq.answer);
    }
    
    await loadContent();
    setIsFaqDialogOpen(false);
    setCurrentFaq(null);
  };

  const handleOpenPinCodeDialog = (pincode: string | null = null, info: string | null = null) => {
    if (pincode && info) {
      setCurrentPinCode({ pincode, info, isEditing: true });
    } else {
      setCurrentPinCode({ pincode: '', info: '', isEditing: false });
    }
    setIsPinCodeDialogOpen(true);
  };

  const handleSavePinCode = async () => {
    if (!currentPinCode) return;

    if (currentPinCode.isEditing) {
        await updatePinCode(currentPinCode.pincode, currentPinCode.info);
    } else {
        await addPinCode(currentPinCode.pincode, currentPinCode.info);
    }
    
    await loadContent();
    setIsPinCodeDialogOpen(false);
    setCurrentPinCode(null);
  };

  const handleOpenMediaDialog = (mediaItem: MediaItem | null = null) => {
    setCurrentMedia(mediaItem ? { ...mediaItem } : { title: '', type: 'video', url: '' });
    setIsMediaDialogOpen(true);
  };

  const handleSaveMedia = async () => {
    if (!currentMedia || !currentMedia.title || !currentMedia.type || !currentMedia.url) return;
    
    if (currentMedia.id !== undefined) {
      await updateMedia(currentMedia.id, currentMedia.title, currentMedia.type, currentMedia.url);
    } else {
      await addMedia(currentMedia.title, currentMedia.type, currentMedia.url);
    }
    
    await loadContent();
    setIsMediaDialogOpen(false);
    setCurrentMedia(null);
  }

  return (
    <>
    <Tabs defaultValue="faq">
      <div className="flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold">Content Management</h2>
            <p className="text-muted-foreground">Manage your chatbot's knowledge base.</p>
        </div>
        <TabsList>
          <TabsTrigger value="faq">FAQs</TabsTrigger>
          <TabsTrigger value="pincodes">PIN Codes</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="scripts">Scripts</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="faq" className="mt-6">
        <Card>
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Add, edit, or remove FAQs to train your chatbot.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenFaqDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add FAQ
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">Question</TableHead>
                        <TableHead>Answer</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {faqs.map((faq) => (
                        <TableRow key={faq.id}>
                            <TableCell className="font-medium">{faq.question}</TableCell>
                            <TableCell className="text-muted-foreground">{faq.answer}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenFaqDialog(faq)}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pincodes" className="mt-6">
         <Card>
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>PIN Code Information</CardTitle>
              <CardDescription>
                Manage the information associated with different PIN codes.
              </CardDescription>
            </div>
             <Button onClick={() => handleOpenPinCodeDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add PIN Code
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>PIN Code</TableHead>
                        <TableHead>Information</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.entries(pinCodeData).map(([pincode, info]) => (
                        <TableRow key={pincode}>
                            <TableCell className="font-medium">{pincode}</TableCell>
                            <TableCell className="text-muted-foreground">{info}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenPinCodeDialog(pincode, info)}>Edit</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
        
      <TabsContent value="media" className="mt-6">
        <Card>
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>Media Content</CardTitle>
              <CardDescription>
                Manage links to videos, images, and reels.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenMediaDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Media
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {media.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">No media content yet.</TableCell>
                    </TableRow>
                )}
                {media.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="capitalize">{item.type}</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-xs">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.url}</a>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenMediaDialog(item)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="scripts" className="mt-6">
        <Card>
            <CardHeader>
                <CardTitle>Custom Scripts</CardTitle>
                <CardDescription>
                Manage custom scripts and advanced chatbot responses. (Coming soon)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-12">
                    <p>This section is under construction.</p>
                </div>
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{currentFaq?.id !== undefined ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
          <DialogDescription>
            {currentFaq?.id !== undefined ? 'Update the question and answer.' : 'Enter a new question and its corresponding answer.'}
          </DialogDescription>
        </DialogHeader>
        {currentFaq && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question">Question</Label>
              <Input 
                id="question" 
                value={currentFaq.question}
                onChange={(e) => setCurrentFaq({...currentFaq, question: e.target.value})}
                placeholder="What is...?" 
              />
            </div>
            <div className=".grid .gap-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea 
                id="answer" 
                value={currentFaq.answer}
                onChange={(e) => setCurrentFaq({...currentFaq, answer: e.target.value})}
                placeholder="The answer is..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsFaqDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveFaq}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={isPinCodeDialogOpen} onOpenChange={setIsPinCodeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>{currentPinCode?.isEditing ? 'Edit PIN Code' : 'Add New PIN Code'}</DialogTitle>
                <DialogDescription>
                    {currentPinCode?.isEditing ? 'Update the information for this PIN code.' : 'Enter a new PIN code and its associated information.'}
                </DialogDescription>
            </DialogHeader>
            {currentPinCode && (
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="pincode">PIN Code</Label>
                        <Input
                            id="pincode"
                            value={currentPinCode.pincode}
                            onChange={(e) => setCurrentPinCode({ ...currentPinCode, pincode: e.target.value })}
                            placeholder="e.g., 110001"
                            disabled={currentPinCode.isEditing}
                            maxLength={6}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="info">Information</Label>
                        <Textarea
                            id="info"
                            value={currentPinCode.info}
                            onChange={(e) => setCurrentPinCode({ ...currentPinCode, info: e.target.value })}
                            placeholder="Historical, cultural, and geographical details..."
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsPinCodeDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSavePinCode}>Save</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>{currentMedia?.id !== undefined ? 'Edit Media' : 'Add New Media'}</DialogTitle>
                <DialogDescription>
                    {currentMedia?.id !== undefined ? 'Update this media item.' : 'Add a new video, image, or reel link.'}
                </DialogDescription>
            </DialogHeader>
            {currentMedia && (
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="media-title">Title</Label>
                        <Input
                            id="media-title"
                            value={currentMedia.title}
                            onChange={(e) => setCurrentMedia({ ...currentMedia, title: e.target.value })}
                            placeholder="e.g., How to apply for a passport"
                        />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="media-type">Type</Label>
                         <Select
                            value={currentMedia.type}
                            onValueChange={(value) => setCurrentMedia({ ...currentMedia, type: value as MediaItem['type'] })}
                         >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="image">Image</SelectItem>
                                <SelectItem value="reel">Reel</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="media-url">URL</Label>
                        <Input
                            id="media-url"
                            value={currentMedia.url}
                            onChange={(e) => setCurrentMedia({ ...currentMedia, url: e.target.value })}
                            placeholder="https://example.com/media.mp4"
                        />
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsMediaDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveMedia}>Save</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}

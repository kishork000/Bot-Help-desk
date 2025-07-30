
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
import { getFaqs, addFaq, updateFaq, getPinCodes, addPinCode, updatePinCode, getMedia, addMedia, updateMedia, getUnansweredConversations, deleteUnansweredConversation, getScripts, addScript, updateScript, deleteScript } from "@/lib/db";
import { PlusCircle, LinkIcon, Trash2, Upload } from "lucide-react";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

type FaqItem = { id: number; question: string; answer: string; };
type PinCodeData = Record<string, string>;
type MediaItem = { id: number; title: string; type: 'video' | 'image' | 'reel'; category: string; url: string; };
type ScriptItem = { id: number; title: string; category: string; content: string; imageUrl: string | null; };
type UnansweredQuery = { id: number, query: string, answer: string | null, timestamp: string };
type CategorizeSelection = {
  faq: boolean;
  pincode: boolean;
  media: boolean;
  script: boolean;
};

export default function ContentPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [pinCodeData, setPinCodeData] = useState<PinCodeData>({});
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [unansweredQueries, setUnansweredQueries] = useState<UnansweredQuery[]>([]);
  const [selectedQueries, setSelectedQueries] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<{ id?: number, question: string, answer: string } | null>(null);

  const [isPinCodeDialogOpen, setIsPinCodeDialogOpen] = useState(false);
  const [currentPinCode, setCurrentPinCode] = useState<{ pincode: string, info: string, isEditing: boolean } | null>(null);

  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<Partial<MediaItem> | null>(null);
  
  const [isScriptDialogOpen, setIsScriptDialogOpen] = useState(false);
  const [currentScript, setCurrentScript] = useState<Partial<ScriptItem> | null>(null);

  const [isCategorizeDialogOpen, setIsCategorizeDialogOpen] = useState(false);
  const [currentCategorizeQuery, setCurrentCategorizeQuery] = useState<UnansweredQuery | null>(null);
  const [categorizeSelection, setCategorizeSelection] = useState<CategorizeSelection>({ faq: false, pincode: false, media: false, script: false });


  async function loadContent() {
      setFaqs(await getFaqs());
      setPinCodeData(await getPinCodes());
      setMedia(await getMedia());
      setScripts(await getScripts());
      setUnansweredQueries(await getUnansweredConversations());
  }

  useEffect(() => {
    loadContent();
  }, []);

  const handleOpenFaqDialog = (faq: FaqItem | null = null, question: string = '', answer: string = '') => {
    setCurrentFaq(faq ? { ...faq } : { question: question, answer: answer });
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
    // Attempt to extract a 6-digit pincode from the query if it exists
    const potentialPincode = (pincode || '').match(/\b\d{6}\b/);
    const initialPincode = potentialPincode ? potentialPincode[0] : '';
    const initialInfo = info || (pincode && !potentialPincode ? `Information about ${pincode}`: '');

    if (pincode && info !== null) {
      setCurrentPinCode({ pincode, info, isEditing: true });
    } else {
      setCurrentPinCode({ pincode: initialPincode, info: initialInfo, isEditing: false });
    }
    setIsPinCodeDialogOpen(true);
  };

  const handleSavePinCode = async () => {
    if (!currentPinCode || !currentPinCode.pincode || !currentPinCode.info) {
        toast({ variant: 'destructive', title: 'Error', description: 'PIN Code and information cannot be empty.' });
        return;
    };

    if (currentPinCode.isEditing) {
        await updatePinCode(currentPinCode.pincode, currentPinCode.info);
    } else {
        await addPinCode(currentPinCode.pincode, currentPinCode.info);
    }
    
    await loadContent();
    setIsPinCodeDialogOpen(false);
    setCurrentPinCode(null);
  };

  const handleOpenMediaDialog = (mediaItem: Partial<MediaItem> | null = null, query: string = '') => {
    setCurrentMedia(mediaItem ? { ...mediaItem } : { title: query, type: 'video', category: 'general', url: '' });
    setIsMediaDialogOpen(true);
  };

  const handleSaveMedia = async () => {
    if (!currentMedia || !currentMedia.title || !currentMedia.type || !currentMedia.category || !currentMedia.url) {
        toast({ variant: 'destructive', title: 'Error', description: 'All media fields are required.' });
        return;
    }
    
    if (currentMedia.id !== undefined) {
      await updateMedia(currentMedia.id, currentMedia.title, currentMedia.type, currentMedia.category, currentMedia.url);
    } else {
      await addMedia(currentMedia.title, currentMedia.type, currentMedia.category, currentMedia.url);
    }
    
    await loadContent();
    setIsMediaDialogOpen(false);
    setCurrentMedia(null);
  }

  const handleOpenScriptDialog = (script: Partial<ScriptItem> | null = null) => {
    setCurrentScript(script ? { ...script } : { title: '', category: '', content: '', imageUrl: '' });
    setIsScriptDialogOpen(true);
  };

  const handleSaveScript = async () => {
    if (!currentScript || !currentScript.title || !currentScript.category || !currentScript.content) {
        toast({ variant: 'destructive', title: 'Error', description: 'Title, category, and content are required for scripts.' });
        return;
    }
    
    if (currentScript.id !== undefined) {
      await updateScript(currentScript.id, currentScript.title, currentScript.category, currentScript.content, currentScript.imageUrl || null);
    } else {
      await addScript(currentScript.title, currentScript.category, currentScript.content, currentScript.imageUrl || null);
    }
    
    await loadContent();
    setIsScriptDialogOpen(false);
    setCurrentScript(null);
  }

  const handleDeleteQuery = async (id: number) => {
      await deleteUnansweredConversation(id);
      await loadContent();
      setSelectedQueries(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
  }

  const handleToggleSelectQuery = (id: number) => {
    setSelectedQueries(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  }

  const handleToggleSelectAllQueries = () => {
    if (selectedQueries.size === unansweredQueries.length) {
        setSelectedQueries(new Set());
    } else {
        setSelectedQueries(new Set(unansweredQueries.map(q => q.id)));
    }
  }

  const handleDeleteSelectedQueries = async () => {
    if (selectedQueries.size === 0) return;
    await Promise.all(Array.from(selectedQueries).map(id => deleteUnansweredConversation(id)));
    await loadContent();
    setSelectedQueries(new Set());
    toast({
        title: "Deleted",
        description: `${selectedQueries.size} conversations have been deleted.`,
    });
  }

  const handleOpenCategorizeDialog = (query: UnansweredQuery) => {
    setCurrentCategorizeQuery(query);
    setCategorizeSelection({ faq: false, pincode: false, media: false, script: false });
    setIsCategorizeDialogOpen(true);
  };

  const handleSaveCategorization = async () => {
    if (!currentCategorizeQuery) return;
    
    toast({
        title: "Ready to Add Content",
        description: "Opening the relevant dialogs for you to save.",
    });

    if(categorizeSelection.faq) {
      handleOpenFaqDialog(null, currentCategorizeQuery.query, currentCategorizeQuery.answer || '');
    }
    if(categorizeSelection.pincode) {
       handleOpenPinCodeDialog(currentCategorizeQuery.query, currentCategorizeQuery.answer);
    }
    if(categorizeSelection.media) {
       handleOpenMediaDialog(null, currentCategorizeQuery.query);
    }

    setIsCategorizeDialogOpen(false);
    
    await deleteUnansweredConversation(currentCategorizeQuery.id);
    await loadContent();
    setCurrentCategorizeQuery(null);
  };
  
  const handleCsvUpload = (type: 'faq' | 'pincode') => {
      // In a real app, this would trigger a file input and then an API call to a serverless function.
      // For this prototype, we'll just show a toast.
      toast({
          title: 'CSV Upload (Coming Soon)',
          description: `This is where the ${type.toUpperCase()} CSV upload functionality will be implemented.`,
      });
  }

  return (
    <>
    <Tabs defaultValue="unanswered">
      <div className="flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold">Content Management</h2>
            <p className="text-muted-foreground">Manage your chatbot's knowledge base.</p>
        </div>
        <TabsList>
          <TabsTrigger value="unanswered">Unanswered Queries</TabsTrigger>
          <TabsTrigger value="faq">FAQs</TabsTrigger>
          <TabsTrigger value="pincodes">PIN Codes</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="scripts">Scripts</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="unanswered" className="mt-6">
        <Card>
          <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Unanswered Conversations</CardTitle>
                  <CardDescription>
                    Review questions your users asked that the chatbot couldn't answer, along with an AI-suggested answer.
                  </CardDescription>
                </div>
                {selectedQueries.size > 0 && (
                     <Button variant="destructive" size="sm" onClick={handleDeleteSelectedQueries}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete ({selectedQueries.size})
                    </Button>
                )}
              </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                        checked={selectedQueries.size === unansweredQueries.length && unansweredQueries.length > 0}
                        onCheckedChange={handleToggleSelectAllQueries}
                        aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-[30%]">Query</TableHead>
                  <TableHead className="w-[30%]">Suggested Answer</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unansweredQueries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No unanswered queries yet. Good job!
                    </TableCell>
                  </TableRow>
                ) : (
                  unansweredQueries.map((query) => (
                    <TableRow key={query.id} data-state={selectedQueries.has(query.id) && "selected"}>
                      <TableCell>
                          <Checkbox
                            checked={selectedQueries.has(query.id)}
                            onCheckedChange={() => handleToggleSelectQuery(query.id)}
                            aria-label={`Select query ${query.id}`}
                          />
                      </TableCell>
                      <TableCell className="font-medium">{query.query}</TableCell>
                      <TableCell className="text-muted-foreground">{query.answer}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(query.timestamp), "PPP p")}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenCategorizeDialog(query)}>
                            <LinkIcon className="mr-2 h-4 w-4"/>
                            Categorize
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteQuery(query.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="faq" className="mt-6">
        <Card>
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Add, edit, or remove FAQs to train your chatbot.
              </CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleCsvUpload('faq')}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                </Button>
                <Button onClick={() => handleOpenFaqDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add FAQ
                </Button>
            </div>
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
             <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleCsvUpload('pincode')}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                </Button>
                <Button onClick={() => handleOpenPinCodeDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add PIN Code
                </Button>
            </div>
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
                Manage videos, images, and reels.
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
                  <TableHead>Category</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {media.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">No media content yet.</TableCell>
                    </TableRow>
                )}
                {media.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="capitalize">{item.type}</TableCell>
                    <TableCell className="capitalize">{item.category}</TableCell>
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
            <CardHeader  className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle>Custom Scripts</CardTitle>
                    <CardDescription>
                    Manage rich, formatted content like guides or articles for users.
                    </CardDescription>
                </div>
                <Button onClick={() => handleOpenScriptDialog()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Script
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {scripts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">No scripts yet.</TableCell>
                            </TableRow>
                        ) : (
                            scripts.map((script) => (
                                <TableRow key={script.id}>
                                    <TableCell className="font-medium">{script.title}</TableCell>
                                    <TableCell className="capitalize">{script.category}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenScriptDialog(script)}>Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
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
            <div className="grid gap-2">
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
                    {currentMedia?.id !== undefined ? 'Update this media item.' : 'Add a new video, image, or other media asset.'}
                </DialogDescription>
            </DialogHeader>
            {currentMedia && (
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="media-title">Title</Label>
                        <Input
                            id="media-title"
                            value={currentMedia.title || ''}
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
                        <Label htmlFor="media-category">Category</Label>
                        <Input
                            id="media-category"
                            value={currentMedia.category || ''}
                            onChange={(e) => setCurrentMedia({ ...currentMedia, category: e.target.value })}
                            placeholder="e.g., sehat, weight loss"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="media-file">Media File</Label>
                        <Input id="media-file" type="file" />
                        <p className="text-xs text-muted-foreground">
                            For this prototype, also paste the public URL below.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="media-url">URL</Label>
                        <Input
                            id="media-url"
                            value={currentMedia.url || ''}
                            onChange={(e) => setCurrentMedia({ ...currentMedia, url: e.target.value })}
                            placeholder="/videos/my-video.mp4"
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

    <Dialog open={isScriptDialogOpen} onOpenChange={setIsScriptDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>{currentScript?.id !== undefined ? 'Edit Script' : 'Add New Script'}</DialogTitle>
                <DialogDescription>
                    {currentScript?.id !== undefined ? 'Update this script.' : 'Create a new rich content guide for your users.'}
                </DialogDescription>
            </DialogHeader>
            {currentScript && (
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="script-title">Title</Label>
                        <Input
                            id="script-title"
                            value={currentScript.title || ''}
                            onChange={(e) => setCurrentScript({ ...currentScript, title: e.target.value })}
                            placeholder="e.g., A Guide to Healthy Living"
                        />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="script-category">Category</Label>
                        <Input
                            id="script-category"
                            value={currentScript.category || ''}
                            onChange={(e) => setCurrentScript({ ...currentScript, category: e.target.value })}
                            placeholder="e.g., Health, Finance"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="script-imageUrl">Header Image URL (Optional)</Label>
                        <Input
                            id="script-imageUrl"
                            value={currentScript.imageUrl || ''}
                            onChange={(e) => setCurrentScript({ ...currentScript, imageUrl: e.target.value })}
                            placeholder="https://placehold.co/600x400.png"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="script-content">Content (Markdown supported)</Label>
                        <Textarea
                            id="script-content"
                            value={currentScript.content || ''}
                            onChange={(e) => setCurrentScript({ ...currentScript, content: e.target.value })}
                            placeholder="## Welcome to the guide..."
                            className="min-h-[200px]"
                        />
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsScriptDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveScript}>Save Script</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isCategorizeDialogOpen} onOpenChange={setIsCategorizeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Categorize Query</DialogTitle>
                <DialogDescription>
                    Link this query to one or more knowledge categories. The bot will use this to provide options to the user.
                </DialogDescription>
            </DialogHeader>
            {currentCategorizeQuery && (
              <div className="grid gap-4 py-4">
                  <div className="p-4 border rounded-md">
                      <p className="font-semibold text-sm">User Query:</p>
                      <p className="text-sm text-muted-foreground italic">"{currentCategorizeQuery.query}"</p>
                  </div>
                  <div className="grid gap-3">
                      <Label>Link to:</Label>
                      <div className="flex items-center space-x-2">
                          <Checkbox id="cat-faq" checked={categorizeSelection.faq} onCheckedChange={(checked) => setCategorizeSelection(s => ({...s, faq: !!checked}))} />
                          <Label htmlFor="cat-faq" className="font-normal">FAQ</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                          <Checkbox id="cat-pincode" checked={categorizeSelection.pincode} onCheckedChange={(checked) => setCategorizeSelection(s => ({...s, pincode: !!checked}))} />
                          <Label htmlFor="cat-pincode" className="font-normal">PIN Code</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                          <Checkbox id="cat-media" checked={categorizeSelection.media} onCheckedChange={(checked) => setCategorizeSelection(s => ({...s, media: !!checked}))} />
                          <Label htmlFor="cat-media" className="font-normal">Media</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                          <Checkbox id="cat-script" checked={categorizeSelection.script} onCheckedChange={(checked) => setCategorizeSelection(s => ({...s, script: !!checked}))} />
                          <Label htmlFor="cat-script" className="font-normal">Script</Label>
                      </div>
                  </div>
              </div>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsCategorizeDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveCategorization}>Save & Add Content</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
